---
title: From MVC to Blazor Server
subtitle: Easily upgrade your ASP.NET Core project
summary: A step-by-step guide to take your MVC project and spice it up with Blazor components - or even Blazor pages!
authors:
- ben-sampica
tags:
- DotNetCore
- CSharp
- Blazor
date: '2021-05-16T00:00:00Z'
lastmod: '2021-05-16T00:00:00Z'
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction

My background is in ASP.NET, specifically MVC. It's been very kind to me over the years, providing a nice jumping off point into the world of programming with it's clear boundaries between front-end and back-end. I've never been a fan of JS frameworks for various reasons - duplication of domain logic and models when front-end and back-end languages differ, instability/breaking changes of the frameworks at times, and debugging and google-ability being more difficult - so I was elated to hear that Microsoft was making their own flavor of SPA called _Blazor_. One problem, though. I'm impatient, I've got all this MVC stuff, and want the benefits _now_!

## The Theoretical

So I want to bootstrap in Blazor into my existing MVC projects. But why? Some of my reasons are:

1. I want the benefits of components - reusability across all the pages on my website, shared UI events, etc.
2. I want the benefits of Blazor pages over controllers. I'm using Mediatr and my controllers are very thin. Controllers don't really make a lot of sense.
3. I want CSS isolation for pages/components.
4. I want to test my UI atomically.
5. Finally, considering the above, I want to be able to structure my UI project into vertical slices/features without having to rewire the Razor engine against MVC's opinionated `Views` and `Areas` approach.

MVC has the concept of View Components and they are nice for what they are but compared to Blazor components are a poor stand in for the latter.

## The Practical

I'm going to focus on Blazor Server for these steps so this will not work for Blazor WASM projects.

Start to finish with a fresh `dotnet new mvc` application, this is how you can do this in `.NET 5.0` ...

 1. Inside of `ConfigureServices`, add:
     - `services.AddRazorPages();`
     - `services.AddServerSideBlazor();`
 2. Inside of `Configure` underneath `UseEndpoints`, add:
     - `endpoints.MapFallbackToPage("/_Host");`
     - `endpoints.MapBlazorHub()`
 3.   Inside of your main layout, add the blazor server js 
      - `<script src="_framework/blazor.server.js"></script>`
 4. Using an `_Imports.razor` file, reference: `Microsoft.AspNetCore.Components.Web` 
      - This is a framework class library so no NuGet package needed
      - Make sure its in scope of your Blazor components!
 5. Add a `_Host.cshtml` file (pull it from a Blazor app)
    - This should reference the MVC _Layout file and be blank other than the App component
    - The page route should be a unique route (just like a SPA calling to an API would be)

      ```csharp
      // _Host.cshtml
      @page "/blazor" 
      @namespace BlazorTechTalk.MvcWithBlazorUI.Pages
      @addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
      @{
           Layout = "~/Views/Shared/_Layout.cshtml";
       }

      <component type="typeof(App)" render-mode="ServerPrerendered" />
      ```

6. Add an `App.razor` component (from a Blazor app)
7. Add an `MainLayout` component (from a Blazor app)
    - This should be blank besides:
       ```
       @inherits LayoutComponentBase
       @Body
       ```
8. Phew, you're done, you can now add `BlazorPage.razor` pages *and components* inside your MVC project!
```csharp
@page "/blazorpage"

<h3>BlazorPage</h3>
```

***Just in case anyone stumbles upon this and only needs Blazor components***

Do step 1-4 but you can omit:
- `services.AddRazorPages();`
- `endpoints.MapToFallbackFile("/Host");`

For a complete coded example [here's an example repository](https://github.com/benjaminsampica/bensampicaPostExamples/tree/master/mvcToBlazor) that has this done for you with some sample components already there to showcase use.

## Some Notes

I've had really great success migrating MVC projects to Blazor. I've been largely creating components first and then retrofitting them back into existing MVC views. However,
when appropriate, I've been adding Pages capabilities and designating entire Areas as Blazor development areas rather than continuing with MVC.