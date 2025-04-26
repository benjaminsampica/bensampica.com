---
title: Testing & Local Development without Dockerfiles in .NET (Aspire)
subtitle: Quickly run and test code using .NET Aspire.
summary: A guide to running and testing .NET projects without Dockerfiles using .NET Aspire and TUnit.
authors:
  - ben-sampica
tags:
  - dotnet
  - CSharp
  - containers
date: "2025-04-10T00:00:00Z"
lastmod: "2025-04-10T00:00:00Z"
url_code: https://github.com/benjaminsampica/bensampica.com/tree/main/content/post/aspiretunit
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction

[There is a part one using TestContainers and XUnit](https://bensampica.com/post/testcontainers), which also explains _why_ containers can improve many aspects of local development and testing.

To recap - we want to run our applications locally and running our tests in an atomic, reproducible way. I'm making an assumption that you already know what .NET Aspire is and won't go into detail here. Not sure? [Read the overview](https://learn.microsoft.com/en-us/dotnet/aspire/get-started/aspire-overview).

## Initial Setup

In order to create the Aspire project we need to perform a few steps first.

1. (Optional) If you do not already have the Aspire templates available, run `dotnet new install Aspire.ProjectTemplates`. These are likely already installed if you use Rider or Visual Studio.
2. Create the project with `dotnet new aspire-starter --output AspireSample`.
3. Upgrade the project to the latest .NET version (.NET 9 as of this posting).
4. Update the NuGet packages in the `AspireSample.AppHost` project to `9.2.0` (as of this posting).
5. In the `AspireSample.AppHost.csproj`, add `<Sdk Name="Aspire.AppHost.Sdk" Version="9.2.0"/>` below the `<Project Sdk="Microsoft.NET.Sdk">` reference.

Your `.AppHost.csproj` should look like this.

```xml
  <Project Sdk="Microsoft.NET.Sdk">

    <Sdk Name="Aspire.AppHost.Sdk" Version="9.2.0"/>

    <PropertyGroup>
      <OutputType>Exe</OutputType>
      <TargetFramework>net9.0</TargetFramework>
      <ImplicitUsings>enable</ImplicitUsings>
      <Nullable>enable</Nullable>
      <IsAspireHost>true</IsAspireHost>
    </PropertyGroup>

    <ItemGroup>
      <ProjectReference Include="..\AspireSample.ApiService\AspireSample.ApiService.csproj" />
      <ProjectReference Include="..\AspireSample.Web\AspireSample.Web.csproj" />
    </ItemGroup>

    <ItemGroup>
      <PackageReference Include="Aspire.Hosting.AppHost" Version="9.2.0" />
      <PackageReference Include="Aspire.Hosting.SqlServer" Version="9.2.0" />
    </ItemGroup>

  </Project>
```

Running into issues? Here's a [quickstart](https://learn.microsoft.com/en-us/dotnet/aspire/get-started/build-your-first-aspire-app?pivots=visual-studio).

You should now have a solution file that contains four projects with a bunch of boilerplate. A quick recap

- `AspireSample.Web` - A Blazor web application.
- `AspireSample.AppHost` - The Aspire AppHost that is the primary project to run when developing locally.
- `AspireSample.ServiceDefaults` - The Aspire-created service defaults that handles logging, monitoring, etc.. This is just a class library.
- `AspireSample.ApiService` - A minimal web api application (weather forecast endpoint).

## Enhancing the AppHost

So just like in Part 1, we want to add SQL Server to our AppHost. For simplicity, I'm going to focus on the minimal api `AspireSample.ApiService` and leave the `AspireSample.Web` project alone. First, we need to add a NuGet package called `Aspire.Hosting.SqlServer` to our `AppHost` project and then wire this up in our builder.

```csharp
var builder = DistributedApplication.CreateBuilder(args);

// Add a SQL Server resource
var mssqlResource = builder.AddSqlServer("DefaultConnection");

var apiService = builder.AddProject<Projects.AspireSample_ApiService>("apiservice")
    .WithReference(mssqlResource); // Add a reference to the existing API service.

builder.AddProject<Projects.AspireSample_Web>("webfrontend")
    .WithExternalHttpEndpoints()
    .WithReference(apiService);

builder.Build().Run();
```

Now when we run the `AppHost` project locally we should see the resource appear on the .NET Aspire dashboard. You can view the underlying container by checking your Docker Desktop application.

{{< figure src="images/sql-dashboard.png" title="The Aspire dashboard with a sql server container resource." lightbox="true" >}}

### Adding EF Core

Next, since we want to be able to easily build our database and its tables, we're going to add the NuGet package `Microsoft.EntityFrameworkCore.SqlServer` to our `ApiService` and configure it.

```csharp
using Microsoft.EntityFrameworkCore;

namespace AspireSample.ApiService;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<Todo> Todos { get; set; }
}

public class Todo
{
    public int Id { get; set; }
    public required string Name { get; set; }
}
```

Just for this post, we're going to use the dbcontext's `EnsureCreatedAsync()` to build the database but in real code you'd use `MigrateAsync()`. Regardless of strategy, we only want to do this in either our test or development environments because in a production environment [you are probably deploying migrations in the pipeline](https://www.bensampica.com/post/azsqlbicepefcore/). Your `Program.cs` file will look like the following after registering the `DbContext` to the service provider and having it create the database on startup. Make sure and review all the comments if you are building this yourself.

```csharp
// Program.cs

using AspireSample.ApiService;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddProblemDetails();

// Add this line.
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.UseExceptionHandler();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
});

app.MapDefaultEndpoints();

// Add this block.
if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Test"))
{
    using var scope = app.Services.CreateScope();

    var applicationDbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await applicationDbContext.Database.EnsureCreatedAsync();
}

app.Run();

// Make this public.
public record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

// Add this line.
public partial class Program { } // For testing purposes.
```

## Adding Tests With TUnit

Earlier this year, Microsoft released _Microsoft.Testing.Platform_, which is a testing platform for .NET that is separate from the VSTest-based test runner that has been pervasive throughout the .NET ecosystem. The goals of this new platform was to provide a more extensible and flexible testing platform that is not tied to Visual Studio. You can read more [here](https://learn.microsoft.com/en-us/dotnet/core/testing/microsoft-testing-platform-intro?tabs=dotnetcli).

[TUnit](https://tunit.dev/) is a new NuGet package, just like _MSTest_, _NUnit_, and _XUnit_, that is built on top of _Microsoft.Testing.Platform_. It brings along a similar set of tools that you are already familiar with but also includes some nice features like a rich assertion library (if you have been rug-pulled by _FluentAssertions_ like a lot of folks). A big thing I appreciate about _TUnit_ is that it is built atop source generators and with asynchronous-first approach so that tests run as fast as possible. If you want to see some examples or benchmarks, check out their [GitHub](https://github.com/thomhurst/TUnit).

_Note:_ If you have not configured your IDE to use _Microsoft.Testing.Platform_ previously, there are a [few buttons you have to click](https://github.com/thomhurst/TUnit#ide).

Okay, now let's create a new test project called `AspireSample.AppHost.Testing`. Because there are no pre-built templates using _TUnit_, we're going to choose _NUnit_ and then modify it. Here's the original `.csproj` from a brand new `dotnet new nunit` project.

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <LangVersion>latest</LangVersion>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="coverlet.collector" Version="6.0.2" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.12.0" />
    <PackageReference Include="NUnit" Version="4.2.2" />
    <PackageReference Include="NUnit.Analyzers" Version="4.4.0" />
    <PackageReference Include="NUnit3TestAdapter" Version="4.6.0" />
  </ItemGroup>

  <ItemGroup>
    <Using Include="NUnit.Framework" />
  </ItemGroup>

</Project>

```

And here's the _TUnit_ modified version.

```xml
<Project Sdk="Microsoft.NET.Sdk">

	<PropertyGroup>
		<TargetFramework>net9.0</TargetFramework>
		<ImplicitUsings>enable</ImplicitUsings>
		<Nullable>enable</Nullable>
		<IsPackable>false</IsPackable>
	</PropertyGroup>

	<ItemGroup>
		<PackageReference Include="Aspire.Hosting.Testing" Version="9.2.0" />
		<PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="9.0.3" />
		<PackageReference Include="Microsoft.Testing.Extensions.CodeCoverage" Version="17.14.2" />
		<PackageReference Include="Respawn" Version="6.2.1"/> <!-- Used for resetting the database later. -->
		<PackageReference Include="TUnit" Version="0.19.32" />
	</ItemGroup>

	<ItemGroup>
		<ProjectReference Include="..\AspireSample.AppHost\AspireSample.AppHost.csproj" />
		<ProjectReference Include="..\AspireSample.ApiService\AspireSample.ApiService.csproj"/> <!-- Reference the Web Api project. -->
	</ItemGroup>

</Project>
```

### Creating the Test Base

{{< notice note >}}
Want to just see the code? [Click here!](https://github.com/benjaminsampica/bensampica.com/tree/main/content/post/aspiretunit)
{{< /notice >}}

Now, in order to run our tests, we need to create a base class that will handle the setup and teardown of our database. This is similar to how _XUnit_ works with `IClassFixture` but instead of using a fixture, we are going to use _TUnit_'s `ClassDataSource` class. This will allow us to run our integration and end-to-end tests in parallel and also provide us with a way to reset the database between tests.

```csharp
// DistributedApplicationTestBase.cs

[ParallelLimiter<DistributedApplicationBaseParallelLimit>]
public abstract class DistributedApplicationBase
{
    [ClassDataSource<DistributedApplicationBaseFactory>(Shared = SharedType.PerTestSession)]
    public required DistributedApplicationBaseFactory TestBaseFactory { get; init; } = null!;

    [Before(Test)]
    public async Task BeforeAnyInheritedTests() => await TestBaseFactory.ResetAsync();

    protected DistributedApplication GetDistributedApplication() => TestBaseFactory.DistributedApplication;

    protected WebApplicationFactory<Program> GetWebApplication() => TestBaseFactory.WebApplication;

    protected T GetRequiredService<T>() where T : class =>
        TestBaseFactory.WebApplication.Services.CreateScope().ServiceProvider.GetRequiredService<T>();
}

public class DistributedApplicationBaseParallelLimit : IParallelLimit
{
    public int Limit => 1;
}

public class DistributedApplicationBaseFactory : IAsyncInitializer, IAsyncDisposable
{
    public DistributedApplication DistributedApplication { get; private set; } = null!;
    public WebApplicationFactory<Program> WebApplication { get; private set; } = null!;
    private Respawner _respawner = null!;
    private string _mssqlConnectionString = null!;
    private string _storageAccountConnectionStringBlob = null!;

    public async ValueTask DisposeAsync()
    {
        await DistributedApplication.DisposeAsync();
        await WebApplication.DisposeAsync();
    }

    public async Task InitializeAsync()
    {
        // Build the entire distributed application - all containers, configuration settings, etc.
        var distributedBuilder = await DistributedApplicationTestingBuilder.CreateAsync<AspireSample_AppHost>();

        distributedBuilder.Environment.EnvironmentName = "Test";
        DistributedApplication = await distributedBuilder.BuildAsync();
        await DistributedApplication.StartAsync();

        _mssqlConnectionString = (await DistributedApplication.GetConnectionStringAsync("DefaultConnection"))!;

        // Add services for web/integration tests.
        WebApplication = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Test");
                builder.UseSetting("ConnectionStrings:ArsDatabase", _mssqlConnectionString);
            });

        using var _ = WebApplication.Services.CreateScope();

        _respawner = await Respawner.CreateAsync(_mssqlConnectionString, new()
        {
            TablesToIgnore = ["__EFMigrationsHistory"]
        });
    }

    public async Task ResetAsync()
    {
        await _respawner.ResetAsync(_mssqlConnectionString);
    }
}
```

Let's step through this code, focusing first on `DistributedApplicationBase`.

```csharp
[ClassDataSource<DistributedApplicationBaseFactory>(Shared = SharedType.PerTestSession)]
public required DistributedApplicationBaseFactory TestBaseFactory { get; init; } = null!;
```

This is the core of our testing base and we are using `ClassDataSource` and `PerTestSession` to state that we only want our test framework to build the factory once. The reason for this is that we only want to build our containers once and then invoke `ResetAsync()` between each test to cleanup, which is what the below code does.

```csharp
[Before(Test)]
public async Task BeforeAnyInheritedTests() => await TestBaseFactory.ResetAsync();
```

Here we are telling _TUnit_ to run this before _every_ test to ensure that we have a clean slate to then add to the database, storage account, etc. for every test.

```csharp
protected DistributedApplication GetDistributedApplication() => TestBaseFactory.DistributedApplication;

protected WebApplicationFactory<Program> GetWebApplication() => TestBaseFactory.WebApplication;

protected T GetRequiredService<T>() where T : class =>
    TestBaseFactory.WebApplication.Services.CreateScope().ServiceProvider.GetRequiredService<T>();
```

The rest of these are convenience methods for higher-order tests. Note that `DistributedApplication` is .NET Aspire's higher-level version of `WebApplicationFactory` which makes sense because it's not just a web application but the entire orchestrated application which is multiple services. We can use it in place of `WebApplicationFactory`, but I've found (thus far) that its limited compared to `WebApplicationFactory`. For example, you cannot easily configure the HttpClient during `CreateHttpClient()`.

I have found myself using `GetRequiredService()` often in order to add things to the database easily so I included it. The reason we are using the `WebApplication` to build it is that `DistributedApplication` does not provide access to the underlying service provider in order to access services we need like the `DbContext`. This makes sense because of the nature of it - `AppHost` has many resources under its umbrella.

Because we are working with a single container for every type of resource and using `ResetAsync()`, we want to limit the parallelism so that only one test runs at a time for these (albeit very quickly resetting itself).

```csharp
[ParallelLimiter<DistributedApplicationBaseParallelLimit>]
public abstract class DistributedApplicationBase
{
}

public class DistributedApplicationBaseParallelLimit : IParallelLimit
{
    public int Limit => 1;
}
```

This sets all classes that inherit from `DistributedApplicationBase` to limit its parallelism to `1`.

Next up, lets look at the meat of the factory itself that spins everything up.

```csharp
public async Task InitializeAsync()
{
    // Build the entire distributed application - all containers, configuration settings, etc.
    var distributedBuilder = await DistributedApplicationTestingBuilder.CreateAsync<AspireSample_AppHost>();

    distributedBuilder.Environment.EnvironmentName = "Test";
    DistributedApplication = await distributedBuilder.BuildAsync();
    await DistributedApplication.StartAsync();

    _mssqlConnectionString = (await DistributedApplication.GetConnectionStringAsync("DefaultConnection"))!;

    // Add services for web/integration tests.
    WebApplication = new WebApplicationFactory<Program>()
        .WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Test");
            builder.UseSetting("ConnectionStrings:DefaultConnection", _mssqlConnectionString);
        });

    using var _ = WebApplication.Services.CreateScope();

    _respawner = await Respawner.CreateAsync(_mssqlConnectionString, new()
    {
        TablesToIgnore = ["__EFMigrationsHistory"]
    });
}
```

This is essentially the guts of the entire thing. .NET Aspire provides a convenient method from `Aspire.Hosting.Testing` in the form of `await DistributedApplicationTestingBuilder.CreateAsync<AspireSample_AppHost>()`. This essentially bootstraps the aspire host just like happens when we run it.

```csharp
distributedBuilder.Environment.EnvironmentName = "Test";
DistributedApplication = await distributedBuilder.BuildAsync();
await DistributedApplication.StartAsync();
```

Here we are setting the environment to test, building it, and then starting the host. We have to start the host manually because we are not using `Aspire.Host.Testing.DistributedApplicationFactory`, which is an option too depending on your context.

Then, we are going to pull out the connection string and create a `WebApplicationFactory` too for the limitations stated above about using `DistributedApplication`.

```csharp
_mssqlConnectionString = (await DistributedApplication.GetConnectionStringAsync("DefaultConnection"))!;

// Add services for web/integration tests.
WebApplication = new WebApplicationFactory<Program>()
    .WithWebHostBuilder(builder =>
    {
        builder.UseEnvironment("Test");
        builder.UseSetting("ConnectionStrings:DefaultConnection", _mssqlConnectionString);
    });
```

Finally, we are setting up our `Respawn` instance in order to reset the database via `ResetAsync()`.

```csharp
using var _ = WebApplication.Services.CreateScope();

_respawner = await Respawner.CreateAsync(_mssqlConnectionString, new()
{
    TablesToIgnore = ["__EFMigrationsHistory"]
});
```

That's it! We can now use these in tests. For example, here's a test that adds a `Todo` to the database and then creates an HttpClient that hits the `apiservice`s `/weatherforecast` endpoint.

```csharp
using Aspire.Hosting.Testing;
using AspireSample.ApiService;
using AspireSample.AppHost.Tests;
using System.Net.Http.Json;

public class UnitTest1 : DistributedApplicationBase
{
    [Test]
    public async Task DoWork()
    {
        var todo = new Todo { Name = "Test" };
        var dbContext = GetRequiredService<ApplicationDbContext>();

        dbContext.Todos.Add(todo);
        dbContext.SaveChanges();

        var httpClient = GetDistributedApplication().CreateHttpClient("apiservice");

        var forecast = await httpClient.GetFromJsonAsync<WeatherForecast[]>("weatherforecast");

        await Assert.That(forecast).IsNotEmpty();
    }
}
```

## The GitHub Workflow

Running tests with `TUnit` requires a slight tweak to how we are used to running tests because we are also going to collect code coverage. The reason for this is that `Microsoft.Testing.Platform` does not play well with `dotnet test` parameters and part of workflows is likely passing parameters - such as collecting code coverage. Instead, we have to do `dotnet run` and then run the test project. Note that this is optional and it is actually possible to run tests using `dotnet test` but I found the syntax to be weirder and harder to read than just using `dotnet run`.

_Note:_ .NET Aspire requires a development certificate install on GitHub's `ubuntu-latest` so I've included it as well.

```yaml
#.github/workflows/workflow.yml
name: Deploy Application

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "9.0"
      - name: Install .NET HTTPS Development Certificate # Required for .NET Aspire
        run: |
          dotnet tool update -g linux-dev-certs
          dotnet linux-dev-certs install
      - uses: actions/checkout@v4
      - name: Test
        run: |
          dotnet restore
          dotnet run -c Release --project src/AspireSample.AppHost.Tests/AspireSample.AppHost.Tests.csproj --coverage --coverage-output-format cobertura --results-directory ./coverage
```

As a final reminder you can view the code [here](https://github.com/benjaminsampica/bensampica.com/tree/main/content/post/aspiretunit). That's it - happy coding!
