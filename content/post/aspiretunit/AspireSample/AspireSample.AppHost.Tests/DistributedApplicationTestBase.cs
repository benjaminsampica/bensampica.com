using Aspire.Hosting;
using Aspire.Hosting.Testing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Projects;
using Respawn;
using TUnit.Core.Interfaces;

namespace AspireSample.AppHost.Tests;

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

public class DistributedApplicationBaseParallelLimit : IParallelLimit
{
    public int Limit => 1;
}