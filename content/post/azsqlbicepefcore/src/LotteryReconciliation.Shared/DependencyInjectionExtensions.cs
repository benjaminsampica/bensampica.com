using Azure.Storage.Blobs;
using LotteryReconciliation.Shared.Infrastructure.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace LotteryReconciliation.Shared;

public static class DependencyInjectionExtensions
{
	public static void AddSharedServices(this IHostApplicationBuilder builder)
	{
		builder.Services.AddDbContext<LotteryDbContext>(options =>
		{
			options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSql"));
			options.EnableDetailedErrors();
			options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
		}, ServiceLifetime.Transient);
	}
}