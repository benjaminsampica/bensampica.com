---
title: Keyed Services in .NET 8 And The Factory Pattern
subtitle: Simplify application code
summary: How keyed services can smooth over the factory pattern in dependency injection scenarios.
authors:
- ben-sampica
tags:
- DotNet
- CSharp
date: '2023-11-15T00:00:00Z'
lastmod: '2023-11-15T00:00:00Z'
featured: false
draft: false
toc: false
---

With the release of [.NET 8](https://devblogs.microsoft.com/dotnet/announcing-dotnet-8/), you can now add _Keyed Services_ to the service provider via `builder.Services.AddKeyedSingleton<T>()`. Also available are `.AddKeyedScoped<T>` and `.AddKeyedTransient<T>` which have the same lifetimes you're familiar with already from `.AddSingleton<T>()`, etc.. There are other use cases for keyed services in .NET 8, but in particular this can reduce the amount of code you need to write when using the factory pattern.

How does this smooth over the factory pattern? Consider patterns where you need to resolve multiple services at runtime that are all conforming to an interface, but do not want to resolve _all_ implementations, just dynamically chosen ones at runtime. The example below showcases what code you might have wrote in .NET 7.

```csharp

// Database Model
public class User
{
    public int Id {get; set;}
    public bool LikesDAndD {get; set;}
    public bool LikesProgramming {get; set;}
    public bool LikesVideoGames {get; set;}
}

// Interface implemented by multiple things that need dependency injection.
public interface INerdValidator
{
    public bool IsNerd();
}

// First validator
public class LikesDAndDNerdValidator : INerdValidator
{
    readonly NerdDbContext _dbContext;
    readonly ICurrentUserService _cus;

    public LikesDAndDNerdValidator(NerdDbContext dbContext, ICurrentUserService cus)
    {
        _dbContext = dbContext;
        _cus = cus;
    }

    public bool IsNerd()
    {
        var user = _dbContext.Users.First(u => u.Id == _cus.Id);

        return user.LikesDAndD;
    }
}

// Second Validator
public class LikesProgrammingNerdValidator : INerdValidator
{
    readonly NerdDbContext _dbContext;
    readonly ICurrentUserService _cus;

    public LikesProgrammingNerdValidator(NerdDbContext dbContext, ICurrentUserService cus)
    {
        _dbContext = dbContext;
        _cus = cus;
    }

    public bool IsNerd()
    {
        var user = _dbContext.Users.First(u => u.Id == _cus.Id);

        return user.LikesProgramming;
    }
}
```

In order to obtain easy access to these validator's dependencies, you might reach to register them to the dependency injection container via a lifetime registration like `.AddScoped<T>()`;

```csharp
// .NET 7
// Program.cs

builder.Services.AddScoped<INerdValidator, LikesProgrammingNerdValidator>();
builder.Services.AddScoped<INerdValidator, LikesDAndDValidator>();

```

The problem is, injecting these into something that can use multiple (but not all) is hard without either juggling concrete types and/or creating your own factory to resolve these.

With .NET 8, you can now utilize keyed services to really simplify this and pick these out at runtime. First, register them.

```csharp
// .NET 8
// Program.cs

builder.Services.AddKeyedScoped<INerdValidator, LikesProgrammingNerdValidator>("Likes Programming");
builder.Services.AddKeyedScoped<INerdValidator, LikesDAndDValidator>("D&D");
```

Now, you're ready to dynamically pull out the services you need in your application code.

```csharp
// This comes from the front end. Users can choose what criteria might make them a nerd.
public class AreYouANerdRequest
{
    public static readonly string[] NerdTypes = [ "D&D", "Likes Programming" ];

    public string[] SelectedNerdTypes {get; set;}
}

public class AreYouANerdHandler
{
    readonly IServiceProvider _serviceProvider; 

    public AreYouANerdHandler(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public void Handle(AreYouANerdRequest request)
    {
        var validators = request.SelectedNerdTypes.Select(
            snt => _serviceProvider.GetKeyedService<INerdValidator>(snt) // This is new in .NET 8!
        );

        bool isANerd;
        foreach(var validator in validators)
        {
            isANerd = isANerd && validator.IsANerd();
        }

        // do other stuff.
    }
}

```

As an aside, if you already know _exactly_ which services you need already, you can just inject them directly via `[FromKeyedServices("key")]`.

```csharp
public class AreYouANerdHandler
{
    readonly INerdValidator _nerdValidator; 

    public AreYouANerdHandler([FromKeyedServices("D&D")] INerdValidator nerdValidator)
    {
        _nerdValidator = nerdValidator;
    }

    public void Handle(AreYouANerdRequest request)
    {
        var isANerd = _nerdValidator.IsANerd();
    }
}
```
On the other side of all of this, if you just want all implementations every time, you can simply constructor inject a collection type (like `IEnumerable<>`) and forgo keyed services entirely.

Happy coding!
