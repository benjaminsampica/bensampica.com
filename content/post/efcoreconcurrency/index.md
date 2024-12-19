---
title: "Configuring Optimistic Concurrency in .NET and EF Core"
subtitle: "A step by step guide"
summary: "How to configure Entity Framework to handle concurrency with .NET 7 or greater."
authors:
  - ben-sampica
tags:
  - CSharp
  - EFCore
date: "2024-12-19T00:00:00Z"
lastmod: "2024-12-19T00:00:00Z"
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introducion

Starting with Entity Framework Core 7 (.NET 7), you can now add [interceptors](https://learn.microsoft.com/en-us/ef/core/logging-events-diagnostics/interceptors). To be reductive, these are essentially ways we can inject or handle behavior during EF's lifecycle methods - when a connection opens, before saving changes, and, as the focus of this article, when a concurrency exception is going to be thrown.

Concurrency is an advanced topic and configuring it is a little different depending on what database provider you are using. 

# Implementation

For this example, I'm going to be using SQL Server. We can configure the database entity (in this case `Person`) with a `[Timestamp]` attribute on a property. For SQL Server this will add a `rowversion` [type of column](https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver16).

```csharp
public class Employee
{
    public int Id { get; set; }
    public string Name { get; set; }

    [Timestamp] public byte[] Version { get; init; } = null!;
}
```

In order to build the actual interceptor, we can subclass the `SaveChangessInterceptor`. These interceptors allow dependency injection which I have just used the primary constructor to inject a logger.

```csharp
public class RetryDbUpdateConcurrencyExceptionInterceptor(ILogger<RetryDbUpdateConcurrencyExceptionInterceptor> logger) : SaveChangesInterceptor
{
    public override async ValueTask<InterceptionResult> ThrowingConcurrencyExceptionAsync(ConcurrencyExceptionEventData eventData, InterceptionResult result, CancellationToken cancellationToken = default)
    {
        logger.LogInformation(eventData.Exception, "A concurrency exception occurred and a retry will be attempted.");

        foreach (var entry in eventData.Entries)
        {
            var databaseValues = await entry.GetDatabaseValuesAsync(cancellationToken) ?? throw new DbUpdateException("The entity being updated no longer exists in the database.");
            entry.OriginalValues.SetValues(databaseValues);
            entry.CurrentValues.SetValues(entry.Entity);
        }

        return InterceptionResult.Suppress(); // If it makes it here, suppress the exception.
    }
}
```

You can add the interceptor to the dependency injection container and add it to the DbContext with the following.

```csharp
  services.AddScoped<RetryDbUpdateConcurrencyExceptionInterceptor>();
  services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
  {
      options.UseSqlServer(configuration.GetConnectionString("Database"));
      options.AddInterceptors(serviceProvider.GetRequiredService<RetryDbUpdateConcurrencyExceptionInterceptor>()); // Pull the interceptor from the service provider and add it to the DbContext.
  });
```

As a bonus, here's an example of a test you can write that will test and make sure the concurrency interceptor is working as expected. I'm using the `TestContainers.MsSql` nuget package to spin up a database easily.

```csharp
using XUnit;
using Testcontainers.MsSql;

public class RetryDbUpdateConcurrencyExceptionInterceptorTests
{
    [Fact]
    public async Task GivenTwoEntitiesAreUpdatedAtTheSameTime_ThenTheConcurrencyExceptionIsResolved()
    {
        // Arrange.
        var container = new MsSqlBuilder()
            .Build();

        var serviceCollection = new ServiceCollection();
        serviceCollection.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
        {
            options.UseSqlServer(container.GetConnectionString());
            options.AddInterceptors(serviceProvider.GetRequiredService<RetryDbUpdateConcurrencyExceptionInterceptor>());
        });

        var services = serviceCollection.BuildServiceProvider();

        var dbContext = services.GetRequiredService<ApplicationDbContext>();

        var person = new Person
        {
            Name = "Test"
        };
        dbContext.Add(person);
        await dbContext.SaveChangesAsync();

        // Act.

        // First update.
        var existingPerson = dbContext.Persons.Single();
        existingPerson!.Name = "Test1";
        dbContext.Update(existingPerson);
        await dbContext.SaveChangesAsync();

        // Concurrent update.
        existingPerson.Name = "Test2";
        dbContext.Entry(existingPerson).OriginalValues[nameof(Sales.Version)] = person.Version; // Assign this to the same version so that both updates have the same version number.
        dbContext.Update(existingPerson);

        var result = await Record.ExceptionAsync(() => dbContext.SaveChangesAsync());

        // Assert.
        Assert.Null(result);
        var expectedPerson = dbContext.Persons.Single();
        Assert.True(expectedPerson.Name == "Test2");
    }
}
```

Happy coding!
