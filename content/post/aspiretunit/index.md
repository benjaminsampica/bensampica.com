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
date: "2025-04-09T00:00:00Z"
lastmod: "2025-04-09T00:00:00Z"
url_code: https://github.com/benjaminsampica/bensampica.com/tree/main/content/post/aspiretunit
featured: false
draft: true
toc: true
---

{{< toc >}}

## Introduction

[There is a part one using TestContainers and XUnit](https://github.com/benjaminsampica/bensampica.com/tree/main/content/post/aspiretunit), which also explains _why_ containers can improve many aspects of local development and testing.

To recap - we want to run our applications locally and running our tests in an atomic, reproducible way. I'm making an assumption that you already know what .NET Aspire is and won't go into detail here. Not sure? [Read the overview](https://learn.microsoft.com/en-us/dotnet/aspire/get-started/aspire-overview)

## Initial Setup

In order to create the Aspire project we need to perform a few steps first.

1. (Optional) If you do not already have the Aspire templates available, run `dotnet new install Aspire.ProjectTemplates`. These are likely already installed if you use Rider or Visual Studio.
2. Create the project with `dotnet new aspire-starter --output AspireSample`.
3. Upgrade the project to the latest .NET version (.NET 9 as of this posting).
4. Update the NuGet packages in the `AspireSample.AppHost` project to `9.1.0` (as of this posting).
5. In the `AspireSample.AppHost.csproj`, add `<Sdk Name="Aspire.AppHost.Sdk" Version="9.1.0"/>` below the `<Project Sdk="Microsoft.NET.Sdk">` reference.

Your `.AppHost.csproj` should look like this.

```xml
  <Project Sdk="Microsoft.NET.Sdk">

    <Sdk Name="Aspire.AppHost.Sdk" Version="9.1.0"/>

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
      <PackageReference Include="Aspire.Hosting.AppHost" Version="9.1.0" />
      <PackageReference Include="Aspire.Hosting.SqlServer" Version="9.1.0" />
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
var mssqlResource = builder.AddSqlServer("DefaultConnection")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithDataVolume();

var apiService = builder.AddProject<Projects.AspireSample_ApiService>("apiservice")
    .WithReference(mssqlResource); // Add a reference to the existing API service.

builder.AddProject<Projects.AspireSample_Web>("webfrontend")
    .WithExternalHttpEndpoints()
    .WithReference(apiService);

builder.Build().Run();
```

Now when we run the `AppHost` project locally we should see the resource appear on the .NET Aspire dashboard with the container running in the background.

{{< figure src="images/sql-dashboard.png" title="The Aspire dashboard with a sql server container resource." lightbox="true" >}}

Next, since we want to be able to easily build our database and its tables, we're going to add the NuGet package `Microsoft.EntityFrameworkCore.SqlServer` to our `ApiService` .

## Adding Tests With TUnit

## The GitHub Workflow
