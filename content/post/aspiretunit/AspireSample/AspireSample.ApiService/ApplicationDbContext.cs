using Microsoft.EntityFrameworkCore;

namespace AspireSample.ApiService;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<Todo> Todos { get; set; }
}

public class Todo
{
    public int Id { get; set; }
    public required string Name { get; set; }
}