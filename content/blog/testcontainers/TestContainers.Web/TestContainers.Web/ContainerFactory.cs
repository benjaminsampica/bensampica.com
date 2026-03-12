using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Testcontainers.Azurite;
using Testcontainers.MsSql;

namespace TestContainers.Web;

public sealed class MsSqlContainerFactory : IAsyncDisposable
{
    private static readonly List<MsSqlContainer> _msSqlContainers = [];

    private MsSqlContainerFactory() { }

    public static async Task<MsSqlContainer> CreateAsync(bool withReuse = false, string? name = null)
    {
        var msSqlContainer = new MsSqlBuilder()
            .WithReuse(withReuse)
            .WithName(name)
            //.WithEnvironment("DOTNET_ENVIRONMENT", "ContainerTest")
            //.WithCommand("ls")
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

public sealed class AzuriteContainerFactory : IAsyncDisposable
{
    private static AzuriteContainer _azuriteContainer = null!;

    private AzuriteContainerFactory() { }

    public static async Task<AzuriteContainer> CreateAsync(bool withReuse = false)
    {
        _azuriteContainer = new AzuriteBuilder()
            .WithReuse(withReuse)
            .WithImage("mcr.microsoft.com/azure-storage/azurite:3.34.0")
            .Build();

        await _azuriteContainer.StartAsync();

        return _azuriteContainer;
    }

    public ValueTask DisposeAsync() => _azuriteContainer.DisposeAsync();
}

public sealed class CustomContainerFactory : IAsyncDisposable
{
    private static IContainer _container = null!;

    private CustomContainerFactory() { }

    public static async Task<IContainer> CreateAsync()
    {
        _container = new ContainerBuilder()
            .WithImage("myimage:1")
            .Build();

        await _container.StartAsync();

        return _container;
    }

    public ValueTask DisposeAsync()
    {
        throw new NotImplementedException();
    }
}