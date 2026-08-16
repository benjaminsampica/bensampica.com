global using Microsoft.EntityFrameworkCore;
using Azure.Core;
using Azure.Identity;
using WebApplication1;

var builder = WebApplication.CreateBuilder(args);

  builder.Services.AddDbContext<PostgreSqlDbContext>((serviceProvider, options) =>
  {
      options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresDatabase"), sql =>
      {
          if (!builder.Environment.IsDevelopment())
          {
              // Configure this data source to get a token from azure and store it for 24 hours.
              sql.ConfigureDataSource(dataSourceBuilderAction =>
              {
                  dataSourceBuilderAction.UsePeriodicPasswordProvider(async (_, ct) =>
                  {
                      var credentials = new DefaultAzureCredential();
                      var token = await credentials.GetTokenAsync(new TokenRequestContext(["https://ossrdbms-aad.database.windows.net/.default"]), ct); // This is a static endpoint for everyone - not just this demo. Use this endpoint!
                      return token.Token;
                  }, TimeSpan.FromHours(24), TimeSpan.FromSeconds(10));
              });
          }
      });
  });

var app = builder.Build();

app.UseHttpsRedirection();

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

app.Run();

internal record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
  public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
