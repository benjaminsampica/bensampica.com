using FluentValidation;
using HtmxMinimalApi.Features;
using HtmxMinimalApi.Features.Shared;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents();

var app = builder.Build();

if (app.Environment.IsProduction()) // This is usually the other way but to demonstrate the functionality I swapped it.
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseStatusCodePagesWithRedirects("/StatusCode/{0}");
    app.UseExceptionHandler("/StatusCode/500", true);
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAntiforgery();

app.MapGet("/", () => new RazorComponentResult<Home>());
app.MapGet("/counter", ([FromQuery] int? currentCount = 0) =>
    {
        var form = new CounterForm { CurrentCount = currentCount };
        return new RazorComponentResult<Counter>(new { CounterForm = form });
    });
app.MapPost("/counter/increment", RazorComponentResult<CounterInfo>([FromForm] CounterForm form, HttpContext httpContext) =>
    {
        var validator = new CounterForm.CounterFormValidator();
        var result = validator.Validate(form);
        if (!result.IsValid) return new(new { CounterForm = form, ValidationResult = result });

        httpContext.Response.Headers.Append("HX-Trigger", "success-alert");
        
        form.CurrentCount++;
        return new(new { CounterForm = form });
    });

app.MapGet("/success-alert", () => new RazorComponentResult<SuccessAlert>());

app.MapGet("/weather", Results<RazorComponentResult<Weather>, RazorComponentResult<WeatherList>>(WeatherList.WeatherForecastRequest query, HttpContext httpContext) =>
{
    // HTMX sends this header when the request is sent by HTMX.
    var isHtmxRequest = httpContext.Request.Headers.ContainsKey("HX-Request"); 
    // HTMX sends this header when the request is boosted. A boosted request happens when the anchor link is clicked on the navbar.
    var isBoosted = httpContext.Request.Headers.ContainsKey("HX-Boosted"); 
    if (!isHtmxRequest || isBoosted) // If a user directly navigates to the page (non-HTMX) OR the anchor link is clicked on the navbar.
    {
        return new RazorComponentResult<Weather>(); // Return the page.
    }
    
    var startDate = DateOnly.FromDateTime(DateTime.Now);
    var summaries = new[] { "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching" };
    var forecasts = Enumerable.Range(1, 100).Select(index => new WeatherList.WeatherForecast
    {
        Date = startDate.AddDays(index),
        TemperatureC = Random.Shared.Next(-20, 55),
        Summary = summaries[Random.Shared.Next(summaries.Length)]
    }).ToArray();

    var pagedForecasts = forecasts
        .Skip(query.Skip)
        .Take(query.Size)
        .ToArray();

    var response = new WeatherList.WeatherForecastResponse
    {
        Items = pagedForecasts,
        Page = query.Page,
        Size = query.Size,
        TotalCount = forecasts.Length
    };
    
    return new RazorComponentResult<WeatherList>(new { response });
});

app.MapGet("/statuscode/{code:int}", (int code) 
    => new RazorComponentResult<StatusCode>(new { code }));

app.MapApplicationRoutes();

app.Run();

public class CounterForm
{
    public int? CurrentCount { get; set; }
    public string? Name { get; set; }

    public class CounterFormValidator : AbstractValidator<CounterForm>
    {
        public CounterFormValidator() => RuleFor(m => m.Name).NotEmpty();
    }
}