---
title: C# Specification Pattern
subtitle: DRY-ly apply domain logic
summary: Learning, using, and extending the specification pattern in C#.
authors:
- ben-sampica
tags:
- CSharp
date: '2020-03-14T00:00:00Z'
lastmod: '2020-03-14T00:00:00Z'
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction
I've recently been helping some good friends of mine create a fantasy football wrapper around the [Yahoo Fantasy Sports API](https://developer.yahoo.com/fantasysports/guide/). The overall Yahoo experience has been a mixed bag, but I got the
opportunity to practice a pattern that I haven't often put into much use as of yet.

## The Theoretical
The pattern is the _Specification_ pattern and it ultimately serves one purpose:

1. Keep your domain logic separate from your implementation

By keeping it separate, we can chain business rules together and reuse them so as to maintain DRYness. As always though use common sense when choosing whether or not to apply a pattern. Don't contract _pattern fever_!

You can take this pattern and do some very powerful things with it. I've found myself writing methods extracting data from a repository but ultimately there was little difference between methods. I've also found myself doing the same but having _god_ methods. Consider the following:

```csharp
// Without specification pattern
public class PlayerService
{
    private readonly IDbContext _dbContext;

    public PlayerService(IDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IEnumerable<Player> GetAll(
      string fantasyTeam = null,
      int? contractLength = null,
      string position = null)
    {
        return _dbContext.Players.Where(p =>
            (fantasyTeam == null || p.FantasyTeam == fantasyTeam)
            && (contractLength == null || p.ContractLength >= contractLength)
            && (position == null || p.Position == position)
        );
    }
}
```
You can see how quickly this either turns into a giant method doing a lot of things or you end up with a ton of small methods doing very similar things.
Let's get dirty and apply the specification pattern to this.
## The Practical
We can start by creating an abstract `Specification<T>` class and creating two methods `ToExpression()` and `IsSatisfiedBy(T entity)`

```csharp
public abstract class Specification<T>
{
    public abstract Expression<Func<T, bool>> ToExpression();

    public bool IsSatisfiedBy(T entity)
    {
        var predicate = ToExpression().Compile();
        return predicate(entity);
    }
}
```

`ToExpression()` returns an `Expression` which is of our entity type and promises to return a `bool`. It is incredibly powerful when combined with LINQ as I'll demonstrate later.

`IsSatisfiedBy(T entity)` returns a `bool` outright and can also be used in LINQ _or_ to evaluate a single entity. It is chaining off of our `ToExpression()` method, compiling it, and then passing in the entity to the expression to determine whether the entity satisfies the expression.

Here's my `Player` entity from the Yahoo Fantasy Sports API which we will apply a specification for.

```csharp
public class Player
{
    public int PlayerId { get; set; }
    public string PlayerKey { get; set; }
    public string Name { get; set; }
    public string Position { get; set; }
    public string FantasyTeam { get; set; }
    public int ContractLength { get; set; }
}
```

And for the specification we want to compare if the player has a contract for the 2020 year.

```csharp
public class Has2020YearContractSpecification : Specification<Player>
{
    public override Expression<Func<Player, bool>> ToExpression()
    {
        return player => player.ContractLength == 2020;
    }
}
```

You can see I've inherited the `Specification` class on my `Has2020YearContractSpecification` class which has a type of `Player`.
Our `ToExpression()` method is evaluating whether the ContractLength is greater than or equal to 2020.

But what if you want to pass in the year? Easy - use the constructor!

```csharp
public class HasGivenYearContractSpecification : Specification<Player>
{
    private readonly int _year;

    public HasGivenYearContractSpecification(int year)
    {
        _year = year;
    }

    public override Expression<Func<Player, bool>> ToExpression() => player => player.ContractLength >= _year;
}
```

Let's jump back to our original `GetAll()` method that is inside the `PlayerService` and apply the specification.
We will replace our original one-note parameters with a collection of filters of our `Specification<Player>` type.

```csharp
public class PlayerService
{
    private readonly IDbContext _dbContext;

    public PlayerService(IDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IEnumerable<Player> GetAll(IEnumerable<Specification<Player>> filters)
    {
        var players = _dbContext.Players;
        if(filters != null)
        {
            foreach (var filter in filters)
            {
                players = players.Where(filter.ToExpression());
            }
        }

        return players;
    }
}
```
```csharp
// Some other method calling this...
var filters = new List<Specification<Player>>()
{
    new HasGivenYearContractSpecification(2020)
};
_playerService.GetAll(filters)
```

The huge benefit is that `GetAll()` will remain unchanged going forward, as _n_-number of specifications are added. New domain needs are just passed as different filters and the method will iterate each one, evaluate it, and return the filtered collection.
This can be reduced in number of lines (if you prefer) by doing the following:

```csharp
if (filters != null)
{
    players = filters.Aggregate(players, (player, filter) => player.Where(filter.ToExpression()));
}
```

I generally find this harder to read but use it if you feel so inclined.

Let's say you want to make this even more DRY by sharing the bit of code that iterates and actually applies the expression to the entity. We can make a static class with a static extension for such a thing.

```csharp
public static class DbContextExtensions
{
    public static IQueryable<T> ApplyFilters<T>(this IQueryable<T> entityCollection, IEnumerable<Specification<T>> filters = null)
    {
        if(filters != null)
        {
            foreach (var filter in filters)
            {
                entityCollection = entityCollection.Where(filter.ToExpression());
            }
        }

        return entityCollection;
    }
}
```

Now going back to our `GetAll()` method

```csharp
public IEnumerable<Player> GetAll(IEnumerable<Specification<Player>> filters)
    => _dbContext.Players.ApplyFilters(filters)
```

How concise is that? For double the points, `.ApplyFilters()` can be used on any entity, not just `Player`.

Jumping back to our other method on our abstract `Specification` class, suppose you already have an entity and you want to see if it conforms to a specification. You can use the `IsSatisfiedBy()` method simply by doing the following.

```csharp
var player = _playerService.GetAnyPlayer();
var has2020Contract = new HasGivenYearContractSpecification(2020).IsSatisfiedBy(player);
```
You can also use this with navigational/relational properties.

```csharp
var team = _teamService_.GetAnyTeam();
team.Players.Where(p => new HasGivenYearContractSpecification(2020).IsSatisfiedBy(p))
// Or
team.Players.Where(p => new HasGivenYearContractSpecification(2020).IsSatisfiedBy)
// Or use ToExpression() / ApplyFilters()...
```

or if you have multiple specifications you can compare each individually or add another extension method
```csharp
public static bool SatisfiesFilters<T>(this T entity, IEnumerable<Specification<T>> filters = null)
{
    if (filters != null)
    {
        foreach (var filter in filters)
        {
            var isSatisfied = filter.IsSatisfiedBy(entity);
            if (isSatisfied == false)
            {
                return false;
            }
        }
    }

    return true;
}
```
Which looks like
```csharp
var player = _playerService.GetAnyPlayer();
var filters = new List<Specification<Player>>()
{
    new HasGivenYearContractSpecification(2020),
    new IsQuarterBackSpecification()
};

var is2020Quarterback = player.SatisfiesFilters(filters);

```
## Some Notes
_Entity Framework Core_ will reduce the noise of chaining `.Where()` when it translates via _LINQ-to-Entities_. You can find out more about how this and their scrubbing process in general works by watching [this great video from the Dotnetos 2019 Conference](https://m.youtube.com/watch?v=r69ZxXgOIK4)

I've seen other bloggers use this pattern and tie it ORM's like _Entity Framework Core_, _Dapper_ or _LiteDB_. Specifically, to do things like `.Include()`. My stance is on this don't - you will likely have unintended side effects and/or latent problems in your queries. You _can_ be successful with it but in my opinion the tradeoffs are not worth it.
