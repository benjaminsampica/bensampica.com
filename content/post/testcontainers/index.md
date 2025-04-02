---
title: Testing & Local Development without Dockerfiles in .NET
subtitle: Quickly run and test code for .NET projects without Dockerfiles.
summary: A guide to running and testing .NET projects without Dockerfiles using TestContainers.NET and Respawner.
authors:
  - ben-sampica
tags:
  - dotnet
date: "2025-04-02T00:00:00Z"
lastmod: "2025-04-02T00:00:00Z"
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction

## Why Containers?

Containers provide a consistent and isolated environment for running applications, making them an essential tool for modern development and testing. Here are some reasons to use containers:

- **Pull Dependencies for Development & Testing**: Quickly spin up services like SQL Server, APIs, or shared infrastructure without manual setup. I will expand upon how we do this later in the post.
- **Simplify Pipelines**: Common deployment targets like containers streamline CI/CD pipelines. For example, if you are using Azure Container Apps, you are always deploying to a container app, regardless of the internals of the application.
- **Hide Infrastructure Complexity**: Abstract away the underlying infrastructure, allowing developers to focus on application logic. Using the Azure Container Apps example again, we can create a .NET Worker Service that handles processing blobs in an Azure Storage Account _instead_ of using an hyper-specific type of project like an Azure Function to do the same thing.

---

## Why No Dockerfile?

While Dockerfiles are a powerful tool for building container images, they can introduce unnecessary complexity in certain scenarios. Here’s why you might avoid using Dockerfiles:

- **Avoid Learning a New DSL**: Dockerfiles require learning a domain-specific language (DSL), whereas you can use familiar tools and languages like .NET which is a general-purpose language (GPL).
- **Simplify Private Feeds**: Managing private feeds and self-signed certificates can be cumbersome with Dockerfiles.
- **Layered Learning**: By avoiding Dockerfiles initially, you can focus on learning containerization concepts incrementally, starting from a familiar environment.

---

## Building Your Application as an Image Locally

{{< notice note >}}
Want to just see the code? [Click here!](https://github.com/benjaminsampica/bensampica.com/tree/main/content/post/testcontainers)
{{< /notice >}}

With .NET, you can build container images for your applications without needing a Dockerfile. This approach is supported natively in .NET 8+ and through additional tooling in .NET 7.

### .NET 8+

.NET 8 introduces built-in support for containerized builds. You can configure your project to build a container image directly from the `.csproj` file.

### .NET 7 and Earlier

For .NET 7, you’ll need the `Microsoft.NET.Build.Containers` package. Install it using the following command:

```bash
dotnet add package Microsoft.NET.Build.Containers
```

### Benefits of Building Without a Dockerfile

1. If you work in an enterprise that has its own network security, you might be behind a firewall that has a organization-issued self-signed certificate. In order to receive and send network traffic inside your container, you need to import the certificate manually into the container and then install it into the base image. If you build it using .NET, there is no need to import self-signed certificates.
2. Additionally, you may be using a private feed for internally-scoped NuGet packages. Just like the certificate, you need to import the GitHub or AzDo token into your base image and then run `dotnet restore` using that NuGet config. If you [peek at the provided documentation](https://github.com/dotnet/dotnet-docker/blob/main/documentation/scenarios/nuget-credentials.md) for this it's something you may not have thought about in a non-container environment.
3. Configuration is handled directly in the .csproj file, reducing complexity for simple configuration. If your image is very complex, you're probably better off using a Dockerfile.

You can run your application locally using the .NET tooling with the following `.csproj` configuration

```xml
  <PropertyGroup>
    <RuntimeIdentifiers>linux-x64</RuntimeIdentifiers> <!-- I chose Linux -->
    <ContainerRuntimeIdentifier>linux-x64</ContainerRuntimeIdentifier>
    <EnableSdkContainerDebugging>True</EnableSdkContainerDebugging>
    <ContainerBaseImage>mcr.microsoft.com/dotnet/aspnet:9.0</ContainerBaseImage>
  </PropertyGroup>

  <ItemGroup>
    <ContainerPort Include="8081" />
  </ItemGroup>

```

If you're putting this into an existing app, you'll also have to configure your `launchSettings.json`.

```json
    "Container (.NET SDK)": {
      "commandName": "SdkContainer",
      "launchUrl": "{Scheme}://{ServiceHost}:{ServicePort}",
      "environmentVariables": {
        "ASPNETCORE_HTTPS_PORTS": "8081",
        "ASPNETCORE_HTTP_PORTS": "8080"
      },
      "publishAllPorts": true,
      "useSSL": true
    }
```

## Tools For Local Dev & Testing

## Tools for Local Development & Testing

There are two primary tools you can use to both simulate real external dependencies for local development and testing. These tools, combined with the native container support in .NET, provide a powerful ecosystem for modern development and testing workflows.

### TestContainers.NET

[TestContainers.NET](https://github.com/testcontainers/testcontainers-dotnet) is a library that simplifies running containerized dependencies for development and testing. It supports a variety of services, including:

- **SQL Server**: Quickly set up a containerized SQL Server instance for integration testing.
- **Azurite**: Emulate Azure Storage services locally.
- **Postgres**: Run PostgreSQL containers for database testing.
- **Service Bus**: Test messaging scenarios with a containerized Service Bus.
- **Other Services**: Easily spin up other dependencies as needed for your application.

### .NET Aspire

.NET Aspire is a set of tools and practices aimed at improving containerized development in .NET for distributed systems. While still evolving, it includes:

- **Pitfall Mitigation**: Addresses common issues encountered in containerized .NET applications.
- **Hardening in .NET 10**: Upcoming improvements in .NET 10 will make containerized development even more robust.
- **High Investment by the .NET Team**: Microsoft continues to invest heavily in containerization support for .NET, ensuring better tooling and performance.

For purposes of this post, I'm going to cover `TestContainers.NET` as there is less scaffoling involved for existing applications. For new applications, I would strongly weigh the pros and cons and see if .NET Aspire is appropriate.

## Problems We Have During Testing

When testing modern applications, especially those that rely on external dependencies like databases or cloud services, several challenges arise. These challenges can slow down development, introduce flakiness in tests, and make it harder to maintain a consistent testing environment. Below are some common problems and their implications:

### Database

Databases are a critical part of most applications, but they introduce several challenges during testing:

- **Creating a Database**: Setting up a database for testing often requires creating schemas, tables, and relationships.
- **Seeding Initial Data Required by the Domain**: Many tests require specific data to exist in the database before they can run.
- **Inserting Data Atomically**: Tests often need to insert data atomically to ensure that the state of the database is predictable and isolated for each test. Without proper isolation, tests can interfere with each other, leading to flaky results.
- **Cleaning Up Between Each Test**: After each test, the database needs to be reset to a known state.

### Azure Storage

Azure Storage is another common dependency for cloud-based applications, and it introduces its own set of challenges:

- **Creating a Container**: In the context of Azure Storage, a "container" refers to a logical grouping of blobs (files).
- **Placing Files Atomically**: Tests often require uploading files to Azure Storage in a way that ensures atomicity.
- **Cleaning Up Between Each Test**: Similar to databases, Azure Storage needs to be cleaned up after each test to ensure that subsequent tests start with a clean slate. This includes deleting containers, blobs, and any associated metadata.

### More Generally, Orchestration

Beyond individual dependencies, orchestrating multiple services and ensuring they work together during tests is a significant challenge:

- **Dependency Coordination**: Many applications rely on multiple services, such as databases, message queues, and APIs. Ensuring these services are available and properly configured during tests can be complex.
- **Environment Consistency**: Tests need to run in a consistent environment to produce reliable results. This includes ensuring that all dependencies are running the correct versions and are configured identically across local, staging, and CI environments.
- **Performance Overhead**: Spinning up and tearing down dependencies for each test can introduce significant performance overhead, especially when dealing with large datasets or complex services.
- **Error Isolation**: When a test fails, it can be difficult to determine whether the failure was caused by the application code, a misconfigured dependency, or an issue with the orchestration itself.

## Problems We Have During Local Development

Local development faces similar challenges to testing, with additional emphasis on efficiency and developer experience:

- **Container Re-use**: Re-creating containers for every run can be time-consuming. Efficiently re-using containers can save time and resources.
- **Speed**: Slow container startup times or dependency initialization can hinder development workflows.
- **Sanity**: Managing multiple dependencies and ensuring they work together seamlessly can be overwhelming, especially in complex applications.

## Solving The Local Development & Testing Problems

{{< notice note >}}
Want to just see the code? [Click here!](https://github.com/benjaminsampica/bensampica.com/tree/main/content/post/testcontainers)
{{< /notice >}}

As I mentioned earlier, we can use `TestContainers.NET`'s existing pre-packaged containers to quickly spin up containers. I'm going to use the mssql package `TestContainers.MsSql` to spin up a SQL Server.

```csharp
public sealed class MsSqlContainerFactory : IAsyncDisposable
{
    private static readonly List<MsSqlContainer> _msSqlContainers = [];

    private MsSqlContainerFactory() { }

    public static async Task<MsSqlContainer> CreateAsync(bool withReuse = false, string? name = null)
    {
        var msSqlContainer = new MsSqlBuilder()
            .WithReuse(withReuse) // Optional. Reuse the container instead of destroying it every time.
            .WithName(name) // Optional. Set a custom name for the container.
            //.WithEnvironment("DOTNET_ENVIRONMENT", "ContainerTest") We can inject environment variables.
            //.WithCommand("ls") We can run custom commands.
            .Build();

        await msSqlContainer.StartAsync();

        _msSqlContainers.Add(msSqlContainer);

        return msSqlContainer;
    }

    public async ValueTask DisposeAsync()
    {
        await ValueTask.FromResult(_msSqlContainers.Select(c => c.DisposeAsync()));
    }
}
```

This can be invoked in your local development or in a test with the following:

```csharp
 var databaseContainer = await MsSqlContainerFactory.CreateAsync(true, Assembly.GetExecutingAssembly().GetName().Name);
    builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
    {
        { "ConnectionStrings:DefaultConnection", databaseContainer.GetConnectionString()},
    });
```

In order to quickly reset the database for each test we can use a NuGet package called `Respawn` (created by Jimmy Bogard). After we build the container and get the connection string, we can now initialize a respawner.

```csharp
var respawn = await Respawner.CreateAsync(_database.GetConnectionString(), new RespawnerOptions
{
    //TablesToIgnore = ["__EFMigrationsHistory"], // Optional. Ignore tables like migrations that might've already been applied.
    //CheckTemporalTables = true // Cleanup temporal tables.
});
```

After each test, we want to invoke the respawn to reset the database using the configured connection string. This typically just takes a millisecond or so so is much quicker than the alternatives like creating a container per test or recreating the database per test.

```csharp
respawn.ResetAsync(scope.ServiceProvider.GetRequiredService<IConfiguration>().GetConnectionString("DefaultConnection")!);
```

Thats it, happy coding! You can view a more thorough example [here](https://github.com/benjaminsampica/bensampica.com/tree/main/content/post/testcontainers).
