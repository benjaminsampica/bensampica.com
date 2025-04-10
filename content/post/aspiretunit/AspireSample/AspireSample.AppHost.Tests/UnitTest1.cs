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