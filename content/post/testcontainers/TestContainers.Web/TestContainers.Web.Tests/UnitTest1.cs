using Microsoft.EntityFrameworkCore;

namespace TestContainers.Web.Tests;

public class UnitTest1 : IntegrationTestBase
{
    [Fact]
    public async Task Test1()
    {
        var dbContext = GetRequiredService<ApplicationDbContext>();

        dbContext.Todos.Add(new Todo { Name = "Test" });
        await dbContext.SaveChangesAsync();

        // Act on a todo.

        //var sut = GetRequiredService<ITodoService>();
        //await sut.DoSomethingAsync();

        // Assert on a todo.
        var expectedTodo = await dbContext.Todos.FirstOrDefaultAsync();
        Assert.True(expectedTodo != null);
    }
}
