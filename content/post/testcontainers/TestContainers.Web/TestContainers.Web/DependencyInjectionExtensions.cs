using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;

namespace TestContainers.Web;

public static class DependencyInjectionExtensions
{
    public static void AddApplicationServices(this IHostApplicationBuilder builder)
    {
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
        });

        builder.Services.AddAzureClients(clients =>
        {
            clients.AddBlobServiceClient(builder.Configuration.GetConnectionString("StorageAccount")).WithName("storage");
        });
    }
}
