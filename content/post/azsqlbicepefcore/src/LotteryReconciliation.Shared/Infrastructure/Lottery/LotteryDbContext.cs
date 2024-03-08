namespace AzureSql.Shared.Infrastructure.Lottery;

public class AzureSqlDbContext(DbContextOptions<LotteryDbContext> options) : DbContext(options)
{

}