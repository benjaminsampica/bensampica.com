namespace WebApplication1;

public class AzureSqlDbContext(DbContextOptions<AzureSqlDbContext> options) : DbContext(options)
{
  public DbSet<Todo> Todos { get; set; }
}

public class Todo
{
  public int Id { get; set; }
  public required string Name { get; set; }
}
