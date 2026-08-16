using Azure.Storage.Blobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Respawn;
using System.Reflection;
using Testcontainers.Azurite;
using Testcontainers.MsSql;

namespace TestContainers.Web.Tests;

[Collection(nameof(TestContainers))]
public class IntegrationTestBase : IAsyncLifetime
{
    private readonly IServiceScope _serviceScope;
    public IntegrationTestBase() { _serviceScope = _scopeFactory.CreateScope(); }
    public Task DisposeAsync() => Task.CompletedTask;
    public async Task InitializeAsync() => await ResetStateAsync();
    public T GetRequiredService<T>() where T : notnull => _serviceScope.ServiceProvider.GetRequiredService<T>();
}

// The setup and library used don't really matter. But we always need to accomplish four things.
// 1. Create the containers used for the tests only once.
// 2. Create the application in memory as close to production as possible. WebApplicationFactory or Host.CreateApplicationBuilder are great choices.
// 3. Create the database/container/service bus - whatever.
// 4. Reset the state of them between tests quickly. Don't tear them down and recreate them to keep it speedy.
[CollectionDefinition(nameof(TestContainers))]
public class IntegrationTesting : ICollectionFixture<IntegrationTesting>, IAsyncLifetime
{
    internal static IServiceScopeFactory _scopeFactory = null!;
    private MsSqlContainer _database = null!;
    private AzuriteContainer _azuriteContainer = null!;
    private static Respawner _respawner = null!;

    public async Task InitializeAsync()
    {
        // Create Containers.
        var databaseTask = MsSqlContainerFactory.CreateAsync(true, Assembly.GetExecutingAssembly().GetName().Name);

        _database = await databaseTask;
        _azuriteContainer = await AzuriteContainerFactory.CreateAsync(true);

        // Build "App" as close to production as possible.
        var hostBuilder = Host.CreateApplicationBuilder();
        hostBuilder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "ConnectionStrings:DefaultConnection", _database.GetConnectionString() },
            { "ConnectionStrings:StorageAccount", _azuriteContainer.GetConnectionString() }
        });
        hostBuilder.Environment.EnvironmentName = "Test";

        hostBuilder.AddApplicationServices();

        _scopeFactory = hostBuilder.Services.BuildServiceProvider().GetRequiredService<IServiceScopeFactory>();

        // EF Core is not required - just easier.
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.MigrateAsync();

        // Can be done using raw SQL. You can read in .sql files too and execute them.
        //var sqlConnection = new SqlConnection(_database.GetConnectionString());
        //var sqlCommand = sqlConnection.CreateCommand();
        //sqlCommand.CommandText = "CREATE DATABASE TestDatabase";
        //await sqlCommand.ExecuteNonQueryAsync();

        _respawner = await Respawner.CreateAsync(_database.GetConnectionString(), new RespawnerOptions
        {
            TablesToIgnore = ["__EFMigrationsHistory"],
            CheckTemporalTables = true
        });
    }

    public async Task DisposeAsync()
    {
        await _database.DisposeAsync();
        await _azuriteContainer.DisposeAsync();
    }

    public static async Task ResetStateAsync()
    {
        using var scope = _scopeFactory.CreateScope();

        await _respawner.ResetAsync(scope.ServiceProvider.GetRequiredService<IConfiguration>().GetConnectionString("DefaultConnection")!);

        var storageContainer = scope.ServiceProvider.GetRequiredService<IAzureClientFactory<BlobServiceClient>>()
            .CreateClient("storage")
            .GetBlobContainerClient("storage");

        await storageContainer.DeleteIfExistsAsync();
        await storageContainer.CreateIfNotExistsAsync();
    }
}
