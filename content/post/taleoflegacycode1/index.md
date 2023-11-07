---
title: 'A Tale of Legacy Code: I'
subtitle: A fresh warning for not cutting corners.
summary: A blast to the past with MVC5 and poorly maintained code
authors:
- ben-sampica
categories:
- DotNet Framework
- CSharp
date: '2020-04-24T00:00:00Z'
featured: false
draft: false
toc: true
---

{{% toc %}}

## Introduction
I'll start off by saying this was partially my fault. I was approached by one of our product owners the day a new sprint was starting and he had no other resource available to get a client request done in the next sprint. With little context on the scope of work, him not having time to walk me through the card, not first diving into the card, or even skimming it and asking a few questions, I naively said "Sure! I'll help". Who doesn't want to be helpful? I had never touched this application before and it was just a _simple_ report from one table, so the PO said. Easy enough, right?

Yeah - I'm writing this post because it's been the card from _HELL_. Likewise, it has reinforced a valuable principle of the software craftsman - _its unprofessional to not say "no" when the circumstances demand it_.

The application was written by one of our former junior developers who had a bad habit of cutting corners, be it cleanliness, problem-solving, or otherwise. Its pulse was being kept alive with duct tape by a contractor who is only part-time.

Let me back up though - so I pull down the code and I immediately see it's an MVC 5 project. No big deal, I'm familiar with how MVC 5 constructs itself and this should be an in-and-out job. "A little boy scout clean up around the area for good measure.", I think. "I'll be in and out in a couple hours and back to my safe space of .NET Core!". I was already thinking about what I was going to tackle _after_ completing this card. I was feeling proud of myself and happy to be a help to the product owner.

I immediately go to run the project just to scan through the web application UI for some context and take my target of where I need to put this report.

Except for some reason the site stylesheets aren't loading...

## The Theoretical

The site, while functional, is all but unusable and doesn't conform anywhere near our branding standards. But it works fine in our hosted dev/qa/production site? Why not locally? Here's what it looks like:

{{< figure src="images/bad.PNG" title="Bad" lightbox="true" >}}

I do some digging and find out the following facts:

1. The site's `.less` files aren't being transpiled to `.css` locally.
2. This was being maintained this way. The site _still_ worked and when deployed it worked **and** looked the way it was intended too so I imagine fixing it was deemed "not worth it" as the problem was tough to narrow down.
3. There seemed to be some code thrashing going on around the bundling and less transformation around the time this originally broke, as well as some NuGet package upgrades.

## The Practical

During my digging I found a folder named `Optimization` and find a `LessTransform.cs`. It's piggy backing off a library named `dotless` to do the heavy lifting via `.Parse()`.

```csharp
public class LessTransform : IBundleTransform
{
    public void Process(BundleContext context, BundleResponse response)
    {
        var temp = Directory.GetCurrentDirectory();
        Directory.SetCurrentDirectory(HttpRuntime.AppDomainAppPath + "/Content/themes/less");
        response.Content = dotless.Core.Less.Parse(response.Content);
        response.ContentType = "text/css";
        Directory.SetCurrentDirectory(temp);
    }
}
```

This simply isn't working at all as the browser is picking up a `.less` file when inspecting the downloaded browser files. When I went digging, I went and looked at a few sites that I had worked on that I _knew_ worked. I found this same method but the implementation was different. Both were pulled off of StackOverflow by someone at our organization and put to use. There's no shame in that - but understanding what it's doing (and it's pitfalls) is part of the process of shared code.

```csharp
public void Process(BundleContext context, BundleResponse bundle)
{
    var pathResolver = new ImportedFilePathResolver(context.HttpContext.Server);
    var lessParser = new Parser();
    var lessEngine = new LessEngine(lessParser);
    ((Importer)lessParser.Importer).FileReader = new FileReader(pathResolver);

    var content = new StringBuilder(bundle.Content.Length);
    foreach (var bundleFile in bundle.Files)
    {
        pathResolver.SetCurrentDirectory(bundleFile.IncludedVirtualPath);
        content.Append(lessEngine.TransformToCss((new StreamReader(bundleFile.VirtualFile.Open())).ReadToEnd(), bundleFile.IncludedVirtualPath));
        content.AppendLine();
    }

    bundle.ContentType = "text/css";
    bundle.Content = content.ToString();
}
```
You can immediately see the difference in these two. I'm now getting compile errors with `dotless` not having an `TransformToCss` method. I look and it's running `dotless aspnet 1.6.4`. Not wanting to go digging through patch notes, I mirror the working projects `dotless core 1.5.2`. Great, it compiles, lets run this bad boy.

It works! Sort of - it's trying to bundle the scripts but now I get a runtime error inside the network tab when its requesting that file.

```
// Additional error details..
Exception details:
ConfigurationErrorsException: Could not load type 'dotless.Core.LessCssHttpHandler ' from assembly 'dotless.Core'. (C:\prokom\Oppdal Kommune CMS6R2Newest2\web.config line 377)
Stack trace:

[ConfigurationErrorsException: Could not load type 'dotless.Core.LessCssHttpHandler
    ' from assembly 'dotless.Core'. (C:\prokom\Oppdal Kommune CMS6R2Newest2\web.config line 377)]
   at System.Web.Configuration.ConfigUtil.GetType(String typeName, String propertyName, ConfigurationElement configElement, XmlNode node, Boolean checkAptcaBit, Boolean ignoreCase)
   at System.Web.Configuration.HttpHandlerAction.Create()
   at System.Web.Configuration.HandlerFactoryCache..ctor(HttpHandlerAction mapping)
   at System.Web.HttpApplication.GetFactory(HttpHandlerAction mapping)
   at System.Web.HttpApplication.MapHttpHandler(HttpContext context, String requestType, VirtualPath path, String pathTranslated, Boolean useAppConfig)
   at System.Web.HttpApplication.MapHandlerExecutionStep.System.Web.HttpApplication.IExecutionStep.Execute()
   at System.Web.HttpApplication.ExecuteStep(IExecutionStep step, Boolean& completedSynchronously)

[Inner exception TypeLoadException: Could not load type 'dotless.Core.LessCssHttpHandler
    ' from assembly 'dotless.Core'.]
   at System.RuntimeTypeHandle.GetTypeByName(String name, Boolean throwOnError, Boolean ignoreCase, Boolean reflectionOnly, StackCrawlMarkHandle stackMark, Boolean loadTypeFromPartialName, ObjectHandleOnStack type)
   at System.RuntimeTypeHandle.GetTypeByName(String name, Boolean throwOnError, Boolean ignoreCase, Boolean reflectionOnly, StackCrawlMark& stackMark, Boolean loadTypeFromPartialName)
   at System.RuntimeType.GetType(String typeName, Boolean throwOnError, Boolean ignoreCase, Boolean reflectionOnly, StackCrawlMark& stackMark)
   at System.Type.GetType(String typeName, Boolean throwOnError, Boolean ignoreCase)
   at System.Web.Compilation.BuildManager.GetType(String typeName, Boolean throwOnError, Boolean ignoreCase)
   at System.Web.Configuration.ConfigUtil.GetType(String typeName, String propertyName, ConfigurationElement configElement, XmlNode node, Boolean checkAptcaBit, Boolean ignoreCase)
```

Oof. Just by seeing this I know what it means. I have to mess with the `web.config` and `.csproj` files in the project to make sure it's referencing the correct `dotless` library and loading the correct package. I open both and painstakingly make the changes but not before I give a soft prayer of thanks to Microsoft for making the `.csproj` files more human-readable in Core.

I had to add

```xml
<handlers>
  <add name="dotless" path="*.less" verb="GET" type="dotless.Core.LessCssHttpHandler,dotless.Core" resourceType="File" preCondition="" />
</handlers>
```
under the `<system.webServer>` property and...

Boom! It works.

{{< figure src="images/good.PNG" title="Good" lightbox="true" >}}

Yeah, yeah. It still looks _really_ bad. Bootstrap 3 is long in the tooth at this point and this still was a very unfortunate use of the framework. A UI update is long overdue - but this application will hopefully disappear when the department that uses it upgrades the application that this just wraps around anyway.

All-in-all this took about two entire days of my time to get to the root of. So much for an in-and-out job :sob:.  Lesson learned - **_HARD_**. Now to actually do the _original work_...

## Some Notes

ASP.NET Core makes a lot better use of their `.csproj` files, at least from a human readability standpoint. For the most part, all that is in there is probably one `<PropertyGroup>` element with the framework target and maybe one or two other properties underneath it. Additionally, the package references are under an `<ItemGroup>` element. Most of the magic is tied into the runtime or locally-restored packages. Gone are the days of `project.json`! You won't be missed. You can read more about this change and others [here](https://docs.microsoft.com/en-us/aspnet/core/migration/proper-to-2x/?view=aspnetcore-3.1).