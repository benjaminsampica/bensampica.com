---
title: ADO.NET vs an ORM (Dapper & EF)
subtitle: The case for using an ORM
summary: A case for an ORM compared to traditional ADO.NET and/or raw SQL scripts.
authors:
- ben-sampica
tags:
- CSharp
- Entity Framework
date: '2020-06-16T00:00:00Z'
lastmod: '2020-06-16T00:00:00Z'
featured: false
draft: false
toc: true

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
# Placement options: 1 = Full column width, 2 = Out-set, 3 = Screen-width
# Focal point options: Smart, Center, TopLeft, Top, TopRight, Left, Right, BottomLeft, Bottom, BottomRight
image:
  placement: 2
  caption: 'Image credit: [**Unsplash**](https://unsplash.com/photos/CpkOjOcXdUY)'
  focal_point: ""
  preview_only: false

# Projects (optional).
#   Associate this post with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects = ["internal-project"]` references `content/project/deep-learning/index.md`.
#   Otherwise, set `projects = []`.
projects: []
---

{{< toc >}}

## Introduction
At my current position, we use Entity Framework Core every single day. I've seen questions on StackOverflow on this topic and had the conversation a surprising number times in different places I've worked over what life without an ORM (object-relational mapper), using traditional ADO.NET and SQL scripts, looks like, compared to using an ORM. In this post, I've leaned heavily on Entity Framework but also included Dapper to showcase the difference. Is it worth the setup, security, and, most importantly, does it ~~blend~~ scale?

## The Theoretical

### Security Considerations

Microsoft has a comprehensive list of security considerations for EF [here](https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/ef/security-considerations). Below is a few of things that organizations will need to consider to do to safely use Dapper or EF.

#### ORM Usage
- Prevent SQL Injection from external user input by avoiding raw-SQL query string building. Both Dapper and Entity Framework provide methods to build parameterized queries as well as passing sanitized parameters to stored procedures and those should be favored except in the most rare and controlled cases.
- Avoid very large result sets. A large result set that selects 5 million joined records into memory can cause the application/system to crash. Only query for what is needed by the application.
- (EF Only) - Service accounts need `[db_datareader]` `[db_datawriter]` and `[db_ddladmin]` permission applied on the database.

### Performance Considerations

Building and maintaining performant, robust, and scaleable enterprise applications is the point of ORM's. [Here is a live example of a relational database implementation using Entity Framework that has over 100,000 records and a SQL response time averaging <10ms](http://efcoreinaction.com/). Be sure to check out the log for the queries being generated and the speeds.

#### Materializing
Understanding materialization is a vital part of using an ORM. Writing the query to materialize the fewest objects possible is key to maintaining performant applications. In EF and Dapper, there are common C# expressions that will materialize a query into memory. With both there are a few unique ways of doing so, as well as some constraints that will auto-materialize without an explicit call.

#### Generated SQL (EF Only)

Entity Framework specifically writes a SQL language called Entities SQL (EF 6+ & EF Core) which is then converted to the targeted data source SQL (MSSQL, MYSQL, etc.). This makes the application layer portable to any type of database without any application changes, but also requires some thought when creating queries for more complex objects as it is easier to stand up queries that have latent performance issues.

## The Practical

With the security and performance considerations in mind, below are a few categories with examples where ORM's really shine and where the application development life cycle is improved.

Consider an application which maintains employees. The application connects to a database with tables called `dbo.Employee` and `domain.EmployeeType` with the following properties:

|**dbo.Employee**           |**domain.EmployeeType**   |
|---------------------------|---------------------------|
|`EmployeeId` (int) [PK]    |`EmployeeTypeId` (int) [PK]|
|`EmployeeTypeId` (int) [FK]|`Value` [nvarchar]         |
|`Name` (nvarchar)          |`Active` (bit)             |
|`Active` (bit)             |                           |

### Speeding Up New Development

Reduction in the amount of time it takes to stand up new queries as well as continuously add new database tables and their associated application models is one of the greatest benefits of an ORM.

**Comparison: Select all columns from all employees**

*ORM (Entity Framework)*

```csharp
public IEnumerable<Employee> GetEmployees()
{
    return _entityFrameworkContext.Employees;
}
```

*ORM (Dapper)*
```csharp
public IEnumerable<Employee> GetEmployees()
{
    var employeeProperties = typeof(Employee).GetProperties().Select(prop => prop.Name);

    var sqlQuery = new StringBuilder("SELECT ")
        .AppendJoin(", ", employeeProperties)
        .Append($" FROM [dbo].[{nameof(Employee)}]")
        .ToString();

    using (var databaseConnection = new SqlConnection(_applicationOptions.ConnectionString))
    {
        return await databaseConnection.QueryAsync<Employee>(
            sqlQuery,
            commandType: CommandType.Text);
    }
}
```

*ADO.NET*

SQL Script
```sql
USE [Employees]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetEmployees]
SELECT * FROM [dbo].[Employee]
GO
USE [Employees]
GRANT EXECUTE ON OBJECT::[dbo].[GetEmployees]
TO rl_Employee_ServiceAccount;
```
Application Layer
```csharp
public List<Employee> GetEmployees())
{
    using (var connection = new SqlConnection())
    {
        using (SqlCommand cmd = new SqlCommand("[dbo].[GetEmployees]", connection))
        {
            cmd.CommandType = CommandType.StoredProcedure;
            connection.Open();
            SqlDataReader reader = cmd.ExecuteReader();
            return HydrateData(reader);

        }
    }
}
public List<Employee> HydrateData(SqlDataReader reader)
{
    var data = new List<Employee>();
    using (reader)
    {
        if(reader.HasRows)
        {
              while (reader.Read())
              {
                   data.Add(
                       new Employee()
                       {
                            EmployeeId = reader.GetInt32(0),
                            EmployeeTypeId = reader.GetInt32(1),
                            Name = reader.GetString(2),
                            Active= reader.GetBoolean(3),
                       }
                   );
              }
              reader.Close();
          }
      }
      return data;
}
```
As shown this is extremely verbose for something that is so simple. Readability decreases and being able to follow the data flow from the stored procedure to the application is weakened - debugging SQL is much more time consuming and prone to mistakes.

This gap in verbosity only lengthens as the query grows more complex. A couple examples:
- Common tangential queries like wanting to perform a count alongside a filtered query is cumbersome (and requires redundancy) in traditional SQL but is simply .Count() in EF. The same goes for query building with optional parameters inside the application through a .Where() clause in EF.
```csharp
public Tuple<IEnumerable<Employee>, int> GetEmployeeByTypeAndStatus(int employeeTypeId, bool? isActive)
{
    // Get all records OR select records that match the optional parameter if it's given.
    var allRecords = _entityFrameworkContext.Employees
        .Where(employee => isActive == null || employee.IsActive == isActive);
    // Get the total count of the base query.
    var totalRecordsCount = allRecords.Count();

    // Filter the data by the type and return the result.
    var filteredData = allRecords
        .Where(employee => employee.EmployeeTypeId == employeeTypeId);
    return new { filteredData , totalRecordsCount };
}
```

- Adding or Updating a record requires either one stored procedure with logic to separate out an add or insert, with almost the entire statement being duplicated twice, or two separate stored procedures that have to be maintained separately - both still being subject to column mismatching.
`_entityFrameworkContext.Employees.AddOrUpdate(employee)`

Imagine the difference in work required if these queries existed and then Employees received a new column (and the possibility of a mistake being made).

### Maintenance Reduction

In our previous example, our current architecture file is reading an unbound array by index and is extremely brittle to new changes. What if the column type is changed? What if the stored procedure appends new columns inside of it and messes up the indexes? Also, every single stored procedure that interacts with the `dbo.Employee` table and needs the new information also needs to be updated.

With an ORM this is as easy as adding a new property to the model and the new property is instantly available to every single query in the entire application which needs it.

```csharp
public class Employee
{
    public int EmployeeId { get; set; }
    public int EmployeeTypeId { get; set; }
    public string Name { get; set; }
    public string Alias { get; set; } // New property added.
    public bool Active { get; set; }
}
```

Imagine there are a bunch of similar queries requiring employee information - any database column changes that happen as the application grows only require adding/updating the property in the `Employee` model. Every single query will be updated automatically to include that new information. Any query that is selecting specific store information through a qualified `.Select()` remains properly unchanged.

There's also something to be said for a reduction of bugs. With a coupled relationship between the database and application through strongly-typed models, there are no accidents that are caused from index, column type mismatching, or stored procedure result set mismatching. The change impact is lessened by less files being modified and less opportunities for error.

*EF Only*

Global query filtering act as a 'middleware' query which append onto the executing query. Consider our employee and employee type tables above that allows for soft-deleting of entities. Global query filters can append a `.Where(employee => employee.IsActive)` onto every query that can be overriden where needed. This both reduces maintenance by preventing developer mistakes and speeds up development.

Owned entities can be setup to only allow them to be created when attached to a parent object. They are often used to reduce common entity grouped properties that do not need their own tables. Consider the models below:

```csharp
public class Employee {
    public int PersonId { get; set; }
    public Name Name { get; set; }
}

public class ExternalNewsletterSubscriber {
    public int ExternalNewsletterSubscriberId { get; set; }
    public Name Name { get; set; }
    public string EmailAddress { get; set; }
}

[Owned]
public class Name {
    public string FirstName { get; set; }
    public string MiddleName { get; set; }
    public string LastName { get; set; }
}
```

The `Name` class is reused in both `Employee` and `ExternalNewsletterSubscriber` and the `Name` properties will be mapped to their proper owner tables in the database. Read more about this [here](https://docs.microsoft.com/en-us/ef/core/modeling/owned-entities).

### Integration Testing

EF provides in-memory database functionality that makes writing integration tests against complicated business logic as easy as possible. Traditionally, when a database is needed for testing it is built by hand in an SSDT project. EF's in-memory databases allows each integration test to have their own atomic database while the test runs - seamlessly working with existing application code with no mocking or existing data required.

```csharp
public class TestsDbContextFixture
{
    public readonly DbContext DbContext { get; set; }

    public TestsDbContextFixture()
    {
        var options = new DbContextOptionsBuilder<DbContext>()
            // Use the in-memory database with a unique name so each test has their own "local" database.
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        DbContext = new DbContext (options);
    }
}

public class IntegrationTests
{
      [Fact]
      public void Test_DbContext()
      {
          // Initialize the in-memory database
          var context = new TestsDbContextFixture().DbContext;
          // ... tests involving the database
      }
}
```

Dapper can easily be combined with mocking frameworks like Moq and/or utilizing light databases like SQLLite or SSDT projects.

## Some Notes

When security and performance are kept in mind, both Entity Framework and Dapper provide huge opportunities to improve the application development life cycle. By speeding up new development, reduction of maintenance and bugfix times, and offering robust integration testing, ORM's should be heavily considered in the application lifecycle for existing and new development.

## Additional Resources

- [Entity Framework Tutorial](https://www.entityframeworktutorial.net/what-is-entityframework.aspx)
- [Entity Framework Documentation](https://docs.microsoft.com/en-us/ef/)