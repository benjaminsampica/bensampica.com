---
title: Fake It So You Can Make It
subtitle: Using libraries to construct fake things for automated tests and local development.
summary: I use Bogus to demonstrate how fake factories can be used to easily create useful, random data, whether it be primitive types or complex objects, for use in testing and non-production data seeding.
authors:
- ben-sampica
tags:
- CSharp
- Testing
date: '2021-08-31T00:00:00Z'
lastmod: '2021-08-31T00:00:00Z'
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction

I'm a huge sucker for having conversations. I like to talk a lot about things I'm passionate about and I promise it's not because I like to hear my own voice (or the _clack_ of my mechanical keyboard). 

Something I'm really passionate about having conversations around is what is important to have inside of a test and what isn't. How do we keep tests focused on what's important and not lines upon lines of setup in order to run one action and one assertion? 

I'm also passionate about the Agile Principles, first and foremost which is _satisfy the customer_. I believe an essential part of accomplishing that is through the use of personas (when we just can't ask someone directly). I believe that the sooner we as developers can talk in the same language as our business people and the longer we can remain talking that same language, the better off both parties will be. 

When we go back to our desks (or click the _end call button_ :)), throats sore from jabbering and ready to tackle the problem domain, how can we as developers maintain this language with the rest of our team throughout our code and up into our environments until it reaches production?

Let's talk about faking data.

## The Theoretical

No matter the type of test you're writing, you're trying to assert _something_ about the system under test. Almost always, the system must be setup first in order to make assertions on it and this takes the form of creating objects and filling them with data. Again, almost always, the objects being created have many properties and methods that are not always relevant to the particular system under test but may be required in order to pass validation rules - such as inserting the record into a database beforehand for an integration test.

On the other hand, seeding data for non-production development can be a powerful tool in order to validate and visualize new feature development, track down bugs, or even create personas (my favorite) that align with your products use cases.

## The Practical

There are many great libraries out there for ready to use for constructing fake data. In this post I'm going to use [Bogus](https://github.com/bchavez/Bogus) (along with [AutoBogus](https://github.com/nickdodd79/AutoBogus)) but I recommend doing a bit of googling and finding your favorite!

I've provided some code samples [here](https://github.com/benjaminsampica/techtalks/tree/main/FakeData/FakeData) if you want to just dive into code.

### Testing

Traditionally, a test will construct whatever objects it needs for the test within itself, such as initializing a new user. This works just fine for unit tests and plain POCOs or simple objects.

```csharp
public class UserEmailValidator
{
    public static bool IsValidEmail(User user)
    {
        return !string.IsNullOrWhiteSpace(user.Email);
    }
}

public class UserEmailValidatorTests
{
  [Test]
  public void GivenUserWithInvalidEmail_ThenReturnsFalse()
  {
      var user = new User
      {
        Email = null
      }

      var result = UserEmailValidator.IsValidEmail(user);

      Assert.IsFalse(result);
  }
}

```

However, as soon as these objects become more complicated, such as with domain-driven design, it becomes a lot more tedious to create valid objects. Doubly so for those that have to be stored in a database with their own integration rules. Additionally, when constructing these objects manually a change in how the initialization needs to happen, the order, or what it means it be a valid object can cause tests that are merely stubbing behavior to break. 

Sure, they're an easy fix but it's annoying, tedious, and most importantly - _preventable_. In large code bases with many thousands of tests even trivial work becomes paralyzing.

Enter Bogus.

Instead of constructing objects manually, we can use Bogus to make a fake factory class that we can import into our tests and then only setup what we need inside the test. You can generate stub data and then explicitly set mock data for your system under test. If we want, we can use our handy-dandy `using static` import statements introduced in C# 6 to make this even better. 

```csharp
public static class FakeFactory
{
    public static User CreateFakeUser()
    {
        // AutoBogus extension of Bogus
        var user = AutoFaker.Generate<User>();

        return user;
    }
}

public class UserEmailValidatorTests
{
  using static FakeFactory;

  [Test]
  public void GivenUserWithInvalidEmail_ThenReturnsFalse()
  {
      var user = CreateFakeUser();
      user.Email = null

      var result = UserEmailValidator.IsValidEmail(user);

      Assert.IsFalse(result);
  }
}
```

I'm a big fan of this type of abstraction as it keeps our tests very small and our concerns focused on just the system under test. 

Fake factories make sharing the setup and creation of fakes easy. As the `User` grows and evolves we can further configure Bogus inside of the fake factory to keep generating a valid user. Bogus is extremely configurable - able to handle constructors, navigational properties, generating real-ish data, derived properties (FirstName, LastName, and then FullName is a combination of those two automatically), and more. 

Now you never have to deal with that tedium again!

A more complete example:

```csharp
public static User CreateFakeUser()
{
    // Bogus
    var faker = new Faker<User>();

    // Specify per-property rules.
    faker.RuleFor(user => user.Email, faker => faker.Person.Email);

    // Specify bulk rules.
    faker.Rules((faker, user) =>
    {
        // 'Person' generates great random data that is related to each other.
        // There are ton of other properties/objects for random 'real' stuff.
        user.Email = faker.Person.Email;
        user.FirstName = faker.Person.FirstName;
        user.LastName = faker.Person.LastName;
        user.FullName = faker.Person.FullName;
        user.Age = faker.Random.Number(40, 80);
    });

    return faker.Generate();
}

```

### Non-Production Development

Bogus can be useful outside of tests as well. With it's ability to set a static seed before generating data, you can create random but consistent data every time that your team can carry forward and have conversations around.

In my personal experience, I've been able to seed a list of users in transient non-production environments whose database is blown away quite often. However, upon reconstruction that list of users reappears with the same people! We created personas around this random list of people and it became easier to have conversations around what these people needed during design time. Because these users also had roles, permissions, and other properties, everyone on the team became familiar with _who_ these people were in our system.

Here's an example of a seed service with Bogus and AutoBogus.

```csharp
public class SeedDataService
{
    public async Task<IEnumerable<User>> SeedAsync()
    {
        // Set a static seed to get the same data every time. Great for seeding random data for development environments.
        // Personas!
        Randomizer.Seed = new Random(123123);

        var users = AutoFaker.Generate<User>(5);

        // Save to database, etc.

        return users;
    }
}
```
