---
title: A Complete Guide to HTMX + .NET Minimal APIs
subtitle: Combining the Modern Web with the simplicity of Web 1.0. 
summary: How to use .NET Minimal APIs and HTMX to create a fast and interactive website. 
authors:
- ben-sampica
categories:
- DotNet
- CSharp
- HTMX
date: '2024-11-13T00:00:00Z'
lastmod: '2024-11-13T00:00:00Z'
featured: false
draft: false
toc: true
---

{{% toc %}}

## Introduction 

With the release of [.NET 8](https://devblogs.microsoft.com/dotnet/announcing-dotnet-8/), you can now return a `RazorComponentResult<T>` from minimal api's which means that blazor components and pages can be returned easily from an endpoint. All dependencies will be injected in the blazor component/service, albeit the rending model they operate under will always be completely static (unless you opt-in to Blazor Web via its bootstrapping script, which is _not_ what I'm going to do). Additionally, .NET 8 brought in some automatic binding features for minimal api so we can easily post forms and files to them.

There is a growing tech chatter over a tiny library with a big heart (and a surprisingly large following on [X](https://x.com/htmx_org) ) called [HTMX](https://htmx.org/) (formerly _intercooler.js_). HTMX is a really simple library that leverages the tools given to us since the very beginning of the web to create fast and interactive websites. Taken from its own website:

> htmx gives you access to AJAX, CSS Transitions, WebSockets and Server Sent Events directly in HTML, using attributes, so you can build modern user interfaces with the simplicity and power of hypertext. 

HTMX may surprise traditional web developers for its "rule"-bending motivations

```
- Why should only <a> & <form> be able to make HTTP requests?
- Why should only click & submit events trigger them?
- Why should only GET & POST methods be available?
- Why should you only be able to replace the entire screen?
```

By-and-large, HTMX (and hypermedia, of course) embrace the concept of [HATEOAS)(https://intercoolerjs.org/2016/05/08/hatoeas-is-for-humans.html), Hypertext As The Engine Of Application State. What this means is that there is no server or client maintaining state; no huge javascript/WASM payload as an "application" and no persistent websocket connection.

For more of the "why hypermedia was built for this all along" you can read the collection of [essays](https://htmx.org/essays/) or even their free book: [Hypermedia Systems](https://hypermedia.systems/book/contents/).

I know my bias against these toolchains is coming out and I sound slightly like a crazy person for touting technologies in a old-is-new again fashion but my angle here is that those tools are really great for low-to-medium interactive applications. There are a _ton_ of use cases for using them and when you need a interactive application, you should consider using them.

However, there are a _ton_ of use cases for CRUD apps and tons of use cases for CRUD + islands of interactivity apps (the term _islands of interactivity_ meaning static content with portions that are interactive). And that's where HTMX really shines - dissolving complexity and returning to the roots of www.

Lets first cover why we're not going to use Blazor Web (SSR/WASM/Server) and use HTMX as a drop-in replacement.

## No Blazor Web

Blazor Web is great but there's quite a few things that I find myself reaching for that HTMX brings out-of-the-box. Here is a small comparison, using HTMX/Minimal API's and Blazor Server Side Rendering (SSR), curated for things that I tend to care about and tools I find myself needing:

- `htmx.js` is only ~14KB. `blazor.web.js` is ~200kb.
- Loading content dynamically based on viewport (intersect, scrolling into view, etc.) is not supported. Only stream rendering is supported (serving the page and then only once performing some asynchronous work).
- Loading content dynamically based on a trigger (load, something is clicked, something is clicked _again_, throttling, queueing, etc.). Not supported.
- Loading content dynamically somewhere on the page based on something that happened somewhere else on the page. Not supported.
- Changing pages in Blazor SSR doesn't bring you to the top of the page if both pages have below-the-fold content and you have scrolled down.
- Dynamically loading javascript scripts is janky and leave behind code when they're swapped out.
- Managing render modes in Blazor is really complicated. It's powerful but nonetheless complicated. Websockets, render modes, caching, etc..
- To get a little more subjective, submitting forms in Blazor SSR is [janky](https://learn.microsoft.com/en-us/aspnet/core/blazor/forms/?view=aspnetcore-8.0) 🤷‍♂️ .
- I also like vertically slicing features and combining Blazor WASM + Server interactivity forces you into a `.Client` project with just the interactive components and forces components to be separated.

## Creating The Project

{{< notice note >}}
Want to just see the code? [Click here!](https://github.com/benjaminsampica/bensampica.com/tree/main/content/post/minimalapihtmx)
{{< /notice >}}

Let us start fresh with a brand new dotnet minimal api and the end goal is going to be to recreate the Blazor sample template with HTMX with a couple extras to make this a complete guide. 

```bash
dotnet new webapi --output HtmxMinimalApi --no-openapi
```

No OpenApi support? Yes that's fine! The API endpoints are going to return HTML and versioning constantly is the point. This is really no different than a server-side rendered application like ASP.NET MVC - the theme has been and is going to continue to be that we are travelling back in time with modern technology.

Additionally, for now I am going to throw out all the weather forecast api boilerplate. It will come back in a modified form later. Below is my entire `Program.cs`.

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents(); // We need to add razor component services so things actually render.

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles(); // We need to add static files so they show up.

app.Run();
```

## Adding A Layout & Navbar

Did I forget to mention I really like the Blazor component developer experience? Because I do. I am going to add a layout, which all of the real pages are going to return and the navbar. Just like a Blazor Web application we are still going to differentiate between pages and components because we will have API endpoints that return both.

Since the goal is to recreate the sample pages, I am just going to pull these straight from a `dotnet new blazor` project with a couple tweaks. You can place these anywhere in the project directory. I am opting for a vertical slice type of folder layout.

```html
<!-- Features/Shared/HtmxLayout.razor 
     The sample's App.razor and MainLayout.razor files combined together. Don't forget the MainLayout.razor.css file! -->
@inherits LayoutComponentBase

<!DOCTYPE html>
<html class="h-100" lang="en-us">
    <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <base href="/"/>
        <link rel="stylesheet" href="bootstrap/bootstrap.min.css"/>
        <link rel="stylesheet" href="app.css"/>
        <link href="HtmxMinimalApi.styles.css" rel="stylesheet">
        <script src="https://unpkg.com/htmx.org@2.0.0"></script> <!-- This is the only thing I have added. HTMX! -->
        <HeadOutlet/>
    </head>
    <body hx-boost="true">
        <div class="page">
            <div class="sidebar">
                <NavMenu/>
            </div>

            <main>
                <div class="top-row px-4">
                    <a href="https://learn.microsoft.com/aspnet/core/" target="_blank">About</a>
                </div>

                <article class="content px-4">
                    @Body
                </article>
            </main>
        </div>

        <div id="blazor-error-ui">
            An unhandled error has occurred.
            <a href="" class="reload">Reload</a>
            <a class="dismiss">🗙</a>
        </div>
    </body>
</html>
```

```html
<!-- Features/Shared/NavMenu.razor 
     Don't forget the NavMenu.razor.css file! -->
<div class="top-row ps-3 navbar navbar-dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="">HtmxMinimalApi</a>
    </div>
</div>

<input type="checkbox" title="Navigation menu" class="navbar-toggler"/>

<div class="nav-scrollable" onclick="document.querySelector('.navbar-toggler').click()">
    <nav class="flex-column">
        <div class="nav-item px-3">
            <NavLink class="nav-link" href="" Match="NavLinkMatch.All">
                <span class="bi bi-house-door-fill-nav-menu" aria-hidden="true"></span> Home
            </NavLink>
        </div>

        <div class="nav-item px-3">
            <NavLink class="nav-link" href="counter">
                <span class="bi bi-plus-square-fill-nav-menu" aria-hidden="true"></span> Counter
            </NavLink>
        </div>

        <div class="nav-item px-3">
            <NavLink class="nav-link" href="weather">
                <span class="bi bi-list-nested-nav-menu" aria-hidden="true"></span> Weather
            </NavLink>
        </div>
    </nav>
</div>
```

```html
<!-- Features/_Imports.razor -->
@using System.Net.Http
@using System.Net.Http.Json
@using Microsoft.AspNetCore.Components.Forms
@using Microsoft.AspNetCore.Components.Routing
@using Microsoft.AspNetCore.Components.Web
@using HtmxMinimalApi.Features.Shared <!-- (Optional) Easily use the shared components in all razor files. -->
```

## The First Page - Home

This is going to be a pattern but I am going to pull the home page from the sample template because we want it to look exactly the same. Except we are _also_ going to include the `HtmxLayout` as the layout for this page.

```html
@layout HtmxLayout
<!-- Features/Home.razor -->
<PageTitle>Home</PageTitle>

<h1>Hello, world!</h1>

Welcome to your new app.
```

Now this is where the magic starts happening. Like I mentioned in the introduction, I am going to use `RenderComponentResult<T>` to actually return the home page from the minimal api. Here is the new `Program.cs`.

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.MapGet("/", () => new RazorComponentResult<Home>()); // New endpoint.

app.Run();
```

Ta-da!!

{{< figure src="images/the-first-page.png" title="Home sweet home." lightbox="true" >}}

## Routing To Another Page

I am going to do the `Counter.razor` page next. All that needs done is add another route to `Program.cs` and copy over `Counter.razor` from the template.

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.MapGet("/", () 
    => new RazorComponentResult<Home>());
app.MapGet("/counter" () 
    => new RazorComponentResult<Counter>()); // New endpoint.

app.Run();
```

```html
<!-- Features/Counter.razor -->
@layout HtmxLayout <!-- Remove routing and add the layout since every page is independent.-->

<PageTitle>Counter</PageTitle>

<h1>Counter</h1>

<p role="status">Current count: @currentCount</p>

<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>

@code {
    private int currentCount = 0;

    private void IncrementCount()
    {
        currentCount++;
    }
}
```

{{< figure src="images/counter-page.png" title="The counter page." lightbox="true" >}}

But wait - the counter button doesn't work!

## The First Island of Interactivity

When the button is clicked, the counter needs to increment up by one. Since the only state is the hypermedia itself 😎, we will need to refresh the HTML on the page in order for the counter to increment. HTMX is not even needed at this point just plain hyperlinks and query parameters, as showcased below.

```html
@layout HtmxLayout

<PageTitle>Counter</PageTitle>

<h1>Counter</h1>

<p role="status">Current count: @CurrentCount</p>

<a class="btn btn-primary" href="/counter?currentCount=@CurrentCount">Click me</a> <!-- This is now an anchor tag. -->

@code
{
    [Parameter] public int CurrentCount { get; set; }
}
```

The endpoint can be updated with an optional route parameter that accepts a current count and increments it by one.

```csharp
// Program.cs
using HtmxMinimalApi.Features;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.MapGet("/", () 
    => new RazorComponentResult<Home>());
app.MapGet("/counter", ([FromQuery] int? currentCount = 0) 
    => new RazorComponentResult<Counter>(new {CurrentCount = currentCount + 1})); // Updated endpoint.

app.Run();
```

{{< figure src="images/raw-html.png" title="Counting increments by one when clicked using server side rendering." lightbox="true" >}}

This has some obvious downsides stemming from the largest one that the entire page is being re-rendered:

1. We are shipping a lot of html back and forth which is a lot of bytes.
2. The state of the page (the hypermedia-only state) needs to be entirely rebuilt from scratch. This application is simple but most are not.
3. Because the page is being entirely rebuilt from scratch database calls to rebuild things on the navbar (like a cart counter) and whatnot need requeried and rebuilt.
4. Non-javascript devices can still use the site.

Enter HTMX. There are a few things that HTMX does out of the box which are built for this. To be reductive (those interested can read the [documentation](https://htmx.org/)), a delta of the existing DOM and the new DOM is taken and a swap of content. Nothing that the browser doesn't technically do anyway. The calls are perfomed via AJAX.

Let's tweak the counter to use HTMX. I'm going to place an `id` tag on the place we want to "refresh" or swap the html. Additionally, placing `hx-target` and `hx-post` tags on the `<a>` tag will do the following:

1. When the anchor tag is clicked
2. HTMX performs an AJAX call to the target url specified in the `hx-post` attribute value.
3. When the request returns, place the response into the location of the `hx-target`.

A separate component is desired so that whenever we click the button we only return the new state of the html page exactly where we want to update it.

Full code is below:

```csharp 
// Program.cs - rest of code omitted.
app.MapGet("/counter", () 
    => new RazorComponentResult<Counter>()); // Moved back to original state.
app.MapGet("/counter/increment", ([FromQuery] int? currentCount = 0) 
    => new RazorComponentResult<CounterInfo>(new { CurrentCount = currentCount + 1 })); // New endpoint.
```
```html
// Features/Counter.razor
@layout HtmxLayout

<PageTitle>Counter</PageTitle>

<h1>Counter</h1>

<CounterInfo/>
```
```html
// Features/CounterInfo.razor
<!-- There is no layout because this is a "partial" or component being returned - not a page.-->
<div id="counter">
    <p role="status">
        @CurrentCount
    </p>

    <a class="btn btn-primary" hx-get="/counter/increment?currentCount=@CurrentCount" hx-target="#counter">Click me</a>
</div>

@code 
{
    [Parameter] public int CurrentCount { get; set; }
}
```

The request back from the new `/counter/increment` endpoint when the anchor button clicked is the following:

```html
<div id="counter"><p role="status">1</p>

<a class="btn btn-primary" hx-get="/counter/increment?currentCount=1" hx-target="#counter">Click me</a></div>
```

Very good! We're just re-generating the HTML we need to change the state of the web page and HTMX is swapping it onto the target.

As an aside, since we are using HTMX to enhance the anchor it could _technically_ be any element as long as the `hx-` elements are present. Do note that by opting to put this functionality on _any_ element, degraded clients (those without javascript) may need a workaround or suffer degraded features.

Speaking of degraded features, the current implementation does _not_ degrade well. Let's fix that.

## Posting A Form

HTMX borrows the term [progressive enhancement](https://htmx.org/docs/#progressive_enhancement) to describe enriching the user experience and providing greater interactivity for web applications. However, there are situations where clients have to operate in a javascriptless state. Whether this is a concern to you or not is dependent upon your use case and it is up to you to make the choice what level of degradation is appropriate and where to degrade gracefully. With javascript frameworks or Blazor Web that require javascript to work, your site is likely completely inoperable.

With HTMX, I do have some options. I'm going to pick one of them - wrapping the counter in a form. There are some new things we are going to do:

1. Add a form tag with an action tag pointing to `counter/increment` and a method of `get`.
2. Add a hidden input with the name `currentCount` and value of the current count.
3. Turn the `<a>` button back into a `<button>`

An added advantage that you might notice in your browser search bar is that the current count shows up as a query parameter. That's pretty neat because, again, we're leveraging the browser itself to be able to restore the state of the hypermedia. The Blazor starter template link returns the counter to zero when you directly navigate there. Using traditional hypermedia, we can accept parameters naturally to restore the state. Of course, you can do this too with Blazor Web SSR which is to its advantage too!

Here is the code:

### With Degradation Support

{{< notice note >}}
A reminder that this type of degradation handling is _optional_ and use-case dependent. 
{{< /notice >}}

```csharp
// Program.cs
// Code omitted for brevity...
app.MapGet("/counter", ([FromQuery] int? currentCount = 0) => 
    new RazorComponentResult<Counter>(new { currentCount })); // Support direct navigating via url to restore the counter.
app.MapGet("/counter/increment", Results<RazorComponentResult<Counter>, RazorComponentResult<CounterInfo>>
    (HttpContext httpContext, [FromQuery] int? currentCount = 0) =>
    {
        currentCount++;
        if (httpContext.Request.Headers.ContainsKey("HX-Request")) // HTMX sends this header when it sends the request so we can operate differently.
        {
            return new RazorComponentResult<CounterInfo>(new { currentCount }); // Return just the component when its an HTMX request.
        }

        return new RazorComponentResult<Counter>(new { currentCount }); // Return the whole page in a degraded scenario.
    });
```

```html
<!-- Features/Counter.razor-->
@layout HtmxLayout

<PageTitle>Counter</PageTitle>

<h1>Counter</h1>

<CounterInfo CurrentCount="CurrentCount"/>

@code
{
    [Parameter] public int CurrentCount { get; set; }
}
```

```html
<!-- Features/CounterInfo.razor -->
<form id="counter" action="/counter/increment" hx-swap="outerHTML" method="get" hx-boost="true" hx-target="#counter">
    <input type="hidden" name="@nameof(CurrentCount)" value="@CurrentCount"/>
    <p role="status">
        @CurrentCount
    </p>

    <button class="btn btn-primary">Click me</button>
</form>

@code 
{
    [Parameter] public int CurrentCount { get; set; }
}
```

### Without Degradation Support

If you do not want to handle degradation, the resulting code looks like this:

```html
<!-- Features/CounterInfo.razor -->
<form id="counter" hx-get="counter/increment?currentCount=@CurrentCount" hx-swap="outerHTML"  hx-target="#counter">
    <p role="status">
        @CurrentCount
    </p>

    <button class="btn btn-primary">Click me</button>
</form>

@code 
{
    [Parameter] public int CurrentCount { get; set; }
}
```
```csharp
// Program.cs
// Code omitted for brevity...
app.MapGet("/counter/increment", ([FromQuery] int? currentCount = 0) 
    => new RazorComponentResult<CounterInfo>(new { currentCount++ });
```

## Validation

To demonstrate validation we're going to go off-sample and add a name field to the counter page. I like the package called FluentValidation so much and honestly I feel like most people are not using DataAnnotations for API-surface validation beyond _very_ simple scenarios or for demos.

I am going to install that in the project and prepare the form for that field:

1. Install the fluent validation package.
2. Add a class with a validator.
3. Adding a reference in `_Imports.razor`.
4. Adding antiforgery support to the minimal api middleware.
5. Include the antiforgery token inside the form.
6. When validation fails, show the messages on the form.
7. Update the minimal api endpoint to return the component if validation fails with the messages.

### Package Install and Validator

Install the `FluentValidation` package via the IDE's nuget package manager or via CLI `dotnet add package FluentValidation` then I'm going to create the following class:

```csharp
public class CounterForm
{
    public int? CurrentCount { get; set; }
    public string? Name { get; set; }

    public class CounterFormValidator : AbstractValidator<CounterForm>
    {
        public CounterFormValidator() => RuleFor(m => m.Name).NotEmpty();
    }
}
```

Additionally, I am going to update the `_Imports.razor` file with `@using FluentValidation.Results`.

### Adding Antiforgery Support

First, we need to add the minimal api middleware so that we can use the `[FromForm]` attribute that is new in .NET 8. 

```csharp
// Program.cs
// Code omitted for brevity...
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAntiforgery(); // Add this line.
```

The antiforgery token boilerplate is a little verbose but necessary in order to be able to send form posts. Essentially, we need to inject the current `HttpContext` and `IAntiforgery` service into a component, which I have named `HtmxAntiforgeryToken.razor`, generate the tokens, and finally include a hidden `input` with the token values so that the form post can include them.

```csharp
<!-- HtmxAntiforgeryToken.razor -->
@using Microsoft.AspNetCore.Antiforgery

<input type="hidden" name="@_antiforgeryFieldName" value="@_antiforgeryToken" />

@code {
    [CascadingParameter] public HttpContext HttpContext { get; set; } = null!;
    [Inject] public IAntiforgery Antiforgery { get; set; } = null!;

    private string _antiforgeryToken = string.Empty;
    private string _antiforgeryFieldName = string.Empty;

    protected override void OnParametersSet()
    {
        var set = Antiforgery.GetAndStoreTokens(HttpContext);

        _antiforgeryToken = set.RequestToken!;
        _antiforgeryFieldName = set.FormFieldName;
    }
}
```

### Adding Validation Messages

Just like the antiforgery token there are is a little bit of boilerplate needed in order to return the messages. We are going to tap into Blazor's existing form logic via `FieldIdentifier` in order to streamline as much as we can. Additionally, I wanted this to _feel_ like other component libraries (including Blazor's own).

Here is the code

```csharp
<!-- HtmxValidationMessage.razor -->
@using System.Linq.Expressions
@typeparam TValue

@if (HasError(For))
{
    <div class="text-danger">@Message</div>
}

@code {
    [CascadingParameter] public ValidationResult ValidationResult { get; set; } = new();
    [Parameter, EditorRequired] public Expression<Func<TValue>>? For { get; set; }

    private string? Message { get; set; }

    private bool HasError(Expression<Func<TValue>>? @for)
    {
        var fieldIdentifier = FieldIdentifier.Create(@for!);

        var error = ValidationResult.Errors.FirstOrDefault(x => x.PropertyName == fieldIdentifier.FieldName);

        if (error == null) return false;

        Message = error.ErrorMessage;

        return true;
    }
}

```

### Updating The Minimal API endpoint

Since we created the `CounterForm` model our endpoints need to return that into our component and page. Additionally, when we submit a post request we need to run our validation and return the result back into `CounterInfo.razor`.

```csharp
// Program.cs
// Code omitted for brevity...
app.MapGet("/counter", ([FromQuery] int? currentCount = 0) =>
    {
        var form = new CounterForm { CurrentCount = currentCount };
        return new RazorComponentResult<Counter>(new { CounterForm = form });
    });
app.MapPost("/counter/increment",  RazorComponentResult<CounterInfo>([FromForm] CounterForm form) =>
    {
        var validator = new CounterForm.CounterFormValidator();
        var result = validator.Validate(form);
        if (!result.IsValid) return new(new { CounterForm = form, ValidationResult = result });
        
        form.CurrentCount++;
        return new(new { CounterForm = form });
    });
```

### Tie It All Together On The Counter

{{< notice tip >}}
Want to just see the code? [Click here!](https://github.com/benjaminsampica/bensampica.com/tree/main/content/post/minimalapihtmx)
{{< /notice >}}

Bringing this all together, we need to utilize more of the Blazor framework in order to pass the validation result down to all our validation messages. Additionally, we need to add our `HtmxAntiforgeryToken` and `HtmxValidationMessage`.

```html
<!-- Features/CounterInfo.razor -->
<CascadingValue Value="ValidationResult">
    <form id="counter" hx-post="counter/increment" hx-swap="outerHTML" hx-target="#counter">
        <HtmxAntiforgeryToken />
        <input type="number" value="@CounterForm.CurrentCount" name="@nameof(CounterForm.CurrentCount)" class="form-control-plaintext w-100"/>
        <label class="w-100">
            Counter Submission Name
            <InputText @bind-Value="CounterForm.Name" name="@nameof(CounterForm.Name)"/>
            <HtmxValidationMessage For="() => CounterForm.Name "/>
        </label>
        <button class="btn btn-primary">Click me</button>
    </form>
</CascadingValue>

@code 
{
    [Parameter] public CounterForm CounterForm { get; set; } = new();
    [Parameter] public ValidationResult ValidationResult { get; set; } = new();
}
```

If I click the button without putting in a name, the form correctly returns the new state (and only the new form state) back to me - no full page reload!

{{< figure src="images/validation-message.png" title="A happy failure message." lightbox="true" >}}

## Swapping Content Somewhere Else

## Table Data

## A Long Page Of Dynamic Content

## Handling HTMX Errors

## Advanced Topics

### The Browser "Back" Button

hx-push-url

### Force persisting state

there may be some things you wish to never be swapped or invoked again which can be advantageous when they are infrequently changing things - dynamic items on an navbar are good candidates.

### Blazor MAUI w/ Htmx

### Automatically adding endpoints

### A Layout Pattern I Like

### Alternative / Assistive Libraries

Rx nuget package
Htmx.Net (razor)