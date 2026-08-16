using Microsoft.EntityFrameworkCore;

namespace TestContainers.Web;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Todo> Todos { get; set; }
}

public class Todo
{
    public int Id { get; set; }
    public string Name { get; set; }
}
