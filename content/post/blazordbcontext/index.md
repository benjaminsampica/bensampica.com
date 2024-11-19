---
title: Blazor Server - EF Core Quirks
subtitle: A pit of failure from EF Core’s default configuration
summary: By default, EF Core’s DbContext is scoped. This will cause issues with asynchronous components accessing data in Blazor Server.
authors:
- ben-sampica
tags:
- DotNetCore
- Entity Framework Core
- CSharp
- Blazor
date: '2020-12-05T00:00:00'
lastmod: '2020-12-05T00:00:00'
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction
Having recently started a new job, I've been working on a product at work that utilizes Blazor Server and has the traditional trappings in the .NET Stack such as Entity Framework Core. This product was my first real foray out of [_breakable toys_](https://www.oreilly.com/library/view/apprenticeship-patterns/9780596806842/ch05s03.html) I've created using Blazor and I've run into quite a few quirks with Blazor Server, especially since the project began when Blazor Server was still in **beta**!

Coming from a largely traditional MVC and API background, the biggest change has been in the way components are rendered by the server and sent to the user. Components are rendered asynchronously when they contain asynchronous code and since, out-of-the-box, Entity Framework Core (and C# language itself) encourages asynchronous code nowadays, this creates a specific problem with the traditional service registration that you may be used to with ASP.NET Core and EF Core.

## The Theoretical
The main documentation for ASP.NET Core and Entity Framework Core has you register your database context to your service container with something like the following

```csharp
services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(Configuration.GetConnectionString("Application")));
```
By default, this is registers the database context as a service with a `Scoped` lifetime. For a short lifetime refresher, out of the box there are three lifetimes:

1. Transient - created by the service container _each time they are injected._
2. Scoped - created by the service container once _per request._
3. Singleton - created by the service container for the _entire application's lifetime._

With Blazor Server, these operate slightly different than traditional Web API or MVC, with scoped and singleton services acting very similar to each other. Scoped services live for the entire lifetime of the user, as long as they stay on that same browser tab. Singleton's live for the lifetime of every user for any tab. Do note that Blazor WebAssembly [_works differently than anything else too_](https://blazor-university.com/dependency-injection/dependency-lifetimes-and-scopes/comparing-dependency-scopes/).

So far so good. But the issue comes into play when we realize how clients interact with the applications. Ignoring doing some heavy threading with parallel workloads, in both MVC/API projects, the server receives a singular request from a client and then the server processes that request within that request's synchronization context. The server then responds with a fully formed request and returns the page/data to the client's browser.

However, with Blazor, we are working with components whose requisite parts make up an entire page someone sees. These components vary in form and function but imagine a table with a list of items you need to do today (todos). With Blazor Server, the component would be responsible for grabbing the data from the database and then the component would render as part of the page.

Still, we're fine. Except when we have two of these components at the same time, grabbing some data. A simple example below

```csharp
// TodosList.razor
@using Microsoft.EntityFrameworkCore

@foreach(var item in Items)
{
    <br/> @item.Title
}

@code {
    [Inject] private ApplicationDbContext ApplicationDbContext { get; set; }

    private List<Todo> Items { get; set; }

    protected async override Task OnInitializedAsync()
    {
        Items = await ApplicationDbContext.Todos.ToListAsync();
    }
}
```
which is then called on our page, _twice._

```html
// Todos.razor
@page "/Todos"

<h1>Things I need to do today</h1>

<Todos></Todos>
<Todos></Todos>
```

Since this is running in parallel, this will throw the following exception

> InvalidOperationException: A second operation started on this context before a previous operation completed. This is usually caused by different threads using the same instance of DbContext. For more information on how to avoid threading issues with DbContext, see https://go.microsoft.com/fwlink/?linkid=2097913.

Ouch, that's no fun. So how do we fix this?

## The Practical
There's six ways I've identified to fix this issue - some more palpable than others. Let's start with the least palpable one, in my opinion.

> Don't use asynchronous calls to your DbContext

Yeah, that doesn't feel good. There isn't much more to say beyond that this solution just feels like giving up. I dislike losing to code!

Let's just move on and forget this one 😉.

> Use Blazor WebAssembly that has a separate API managing the data access calls.

This is exactly how it should be done if you're using Blazor WebAssembly and follows the same pattern that similar ASP.NET Core Angular or React projects look. Obviously, this is a huge effort and you're may be too far along to really pivot toward this. Likewise, it may be undesirable for other reasons.

Onto the next one.

> Override your service registration for your DbContext to be _Transient_.

This can be accomplished by doing the following to your service registration

```
services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(Configuration.GetConnectionString("Application")), ServiceLifeTime.Transient); // <-- Add this
```

This might work for you if your server calls are lean and don't require change tracking across your injected dependencies. You probably don't if you've avoided having some anemic design, but hey reality isn't so kind sometimes.

As stated, this _will_ break change tracking for Entity Framework Core unless `SaveChanges` is called inside the same class that modified the entity. Additionally, since components could live a very long time (such as a navbar with an alert counter), you could accidentally have some very long living DbContexts unintentionally.

The fourth and fifth way are identical, but the fifth way requires .NET 5.0.

It involves creating a DbContextFactory and using that in place of the traditional service injection.

For the fourth way, if you're using .NET Core 3.1, refer to the documentation [here](https://docs.microsoft.com/en-us/aspnet/core/blazor/blazor-server-ef-core?view=aspnetcore-3.1#database-access-3x).

For the fifth way, if you're using .NET >=5.0, refer to the documentation [here](https://docs.microsoft.com/en-us/aspnet/core/blazor/blazor-server-ef-core?view=aspnetcore-5.0#database-access-5x).

For .NET Core 5, you can see that the classes, interfaces, and extensions for creating an injectable DbContextFactory are part of the core library.

As the documentation states, this changes your approach from injecting a `DbContext` and instead injecting the factory and creating a new `DbContext`. Keep in mind the recommended scope is _per-operation_ as well as needing disposed afterward.

The sixth and final way involves working with `OwningComponentBase<>` which you can read more about [here](https://docs.microsoft.com/en-us/aspnet/core/blazor/fundamentals/dependency-injection?view=aspnetcore-5.0#utility-base-component-classes-to-manage-a-di-scope).

## Some Notes
With Blazor being so new, it's hard to find documentation or even StackOverflow questions/answers on a lot of topics. However, with the release of .NET 5.0 I've found this to have improved quite a bit. If you haven't played around with Blazor Server or WASM, I'd encourage you to do it. Even with it's quirks and documentation woes, it's hard for me to imagine going back to the wild west of JavaScript and traditional MVC.
