using HtmxMinimalApi.Features.Shared;
using Microsoft.AspNetCore.Http.HttpResults;

namespace HtmxMinimalApi.Features;

public partial class EndpointRouting : IRouteDefinition
{
    public IEndpointRouteBuilder MapRoutes(IEndpointRouteBuilder routes)
    {
        routes.MapGet("/endpointrouting", () => new RazorComponentResult<EndpointRouting>());
        
        return routes;
    }
}
