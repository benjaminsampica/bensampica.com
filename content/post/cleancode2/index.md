---
title: 'Clean Code - Part II: The Four Principles (of Art)'
subtitle: What does art and code have in common?
summary: Drawing parallels from the four basic principles of art to bring order to the code we write.
authors:
- ben-sampica
tags:
- Software Craftsmanship
date: '2021-01-31T00:00:00Z'
lastmod: '2021-01-31T00:00:00Z'
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction

> Any fool can write code that a computer can understand. Good programmers write code that humans can understand.
> <br/> - Martin Fowler

I recently volunteered to give a technical talk at my place of employment and I chose the topic to be on Clean Code. As something that is important to me and [I've written on before](https://www.bensampica.com/post/cleancode1/), I wanted to tackle another foundational piece of what makes Clean Code _clean_. 

I recently read [The Non-Designers Design Book](https://www.amazon.com/Non-Designers-Design-Book-4th/dp/0133966151) - not a technical book but a great resource for a full-stack web developer to enhance their web designs. Inside its contents, Robin Williams (not the actor) discusses four basic principles of art, among other things. I found myself reflecting on these and felt there were parallels between these principles of art and code.

## The Theoretical

The Four Basic Principles presented in the book are thus:

1. Contrast
2. Repetition
3. Alignment
4. Proximity

The same thing that makes a movie poster, a wall painting, or drawing grab our attention to us is the same thing that makes code stand out and understandable. When these principles are not adhered to, you get jarring, disjointed, and less-than-ideal feedback to the code you've written.

## The Practical

### The Principle of Contrast

> Objects that contrast each other are easier to understand. 

Consider the IDEs of days gone by (plain Notepad, anyone). How easy was it to spot misspellings, alignment issues, or class usage? I did my fair share of Notepad coding in my highschool and early college days and it was horrible. 

Consider the differences between the contrasting tools - Notepad and Powershell versus VSCode and Windows Terminal.

{{< figure src="images/1.png" title="Principle of Contrast" lightbox="true" >}}

Talk about the stark difference between the two​!

Nothing was gained – it didn’t make me a better developer starting out in Notepad.​ It’s horrible and we are all better for its obsolescence .​

Notice the contrast on the VS code picture in particular. Namespaces and return types are italic and cyan. Methods are green, text is yellow. Static classes are white. Even the bracket pairs are colorized by their nested level. These visual cues make reading code so much easier.​ There is a non-zero amount of time saved doing this. Also, a non-zero amount of bugs caught from these contextual clues.​

Upgrade your work life and productivity by upgrading your development tools – starting with finding a theme you like staring at 8 hours a day. Writing clean code includes treating yourself to an experience that makes it is more readable to you.

### The Principle of Repetition

> Reusing the same or similar elements through your design ​brings a clear sense of unity, consistency, and cohesiveness

```
using System;

namespace PrincipleOfRepetition
{
    public class Pizza
    {
        private readonly List<string> _pizzaToppings;
        private readonly List<string> _pizzaSides;
        private readonly decimal _price;

        public Pizza(string size)
        {
            SetInitialPrice(size);
        }

        public void AddTopping(string topping) // Both methods of adding to a collection 
            => _pizzaToppings.Add(topping);    // repeat the same mental concept.

        public void AddSide(string side)
            => _pizzaSides.Add(side);

        public decimal GetPrice() => _price;

        private void SetInitialPrice(string size)
            => _price = size switch {
                "S" => 5.99m,
                "M" => 7.99m,
                "L" => 10.99m,
                _ => throw new ArgumentOutOfRangeException($"Pizza size not supported with value of {size}.")
            };
    }

    // Both Hamburger and Pizza repeat the same language of how to interact with them.
    // "Add" "Get" "Set"
    // The verbs themselves aren't as important as long as they are repeated all throughout the project.
    // Use OOP principles like abstraction to turn this repetition into a pit of success for others.
    // We could implement base abstract classes or interfaces to enforce these naming and functionality patterns.
    // This could be a good spot for a Decorator pattern or a Factory pattern if appropriate.
    // Design patterns are another form of repetition.
    public class Hamburger 
    {
        // Private fields float to the top.
        private readonly List<string> _burgerToppings; // Underscores for private fields with a camelCase convention.
        private readonly List<string> _burgerSides;
        private readonly decimal _price;

        // Constructor is next.
        public Hamburger(string size)
        {
            SetInitialPrice(size);
        }

        // Publicly called methods are next.
        public void AddTopping(string topping)
            => _burgerSides.Add(topping);      

        public void AddSide(string side)
            => _burgerToppings.Add(side);

        public decimal GetPrice() => _price;

        // Private methods sink to the bottom.
        private void SetInitialPrice(string size)
            => _price = size switch {
                "1/4" => 3.75m,
                "1/3" => 4.50m,
                "1/2" => 5.00m,
                _ => throw new ArgumentOutOfRangeException($"Hamburger size not supported with value of {size}.")
            };
    }
}
```

### The Principle of Alignment

> Poorly aligned elements look cluttered and unfinished

```
namespace PrincipleOfAlignment
{
    public class ShoppingBot
    {
        public void SizeOfClothes() {
            // Identation helps naturally to keep our field of vision narrow - like reading blocks of code in a method.
            var viewModel = new ClothesViewModel();

            Console.WriteLine("Enter your shirt size"); 
            var shirtSize = Console.ReadLine();
            viewModel.ShirtSize = shirtSize;

            Console.WriteLine("Enter your shoe size");
            var shoeSize = Console.ReadLine();
            viewModel.ShoeSize = shoeSize;
        }

        public void ShippingAddress_NoAlignment(string lineOne, string lineTwo, string lineThree, string city, string state, string zip)
        {

        }

        public void ShippingAddress_Alignment(
            string lineOne,
            string lineTwo,
            string lineThree,
            string city,
            string state,
            string zip
        )
    }

    public class ClothesViewModel
    {
        // Humans have an easier time understanding a complete thought when it is aligned horizontally than they do vertically.
        // Imagine
        // Trying
        // To
        // Read
        // A
        // Book
        // Like
        // This

        // For lots of properties (like in DTOs or view models)
        // having a complete thought aligned on one line is a lot easier to read
        // - unlike this comment.

        [Required] public string ShirtSize { get; set; }
        [Required] public string ShoeSize { get; set; } 

        // Versus

        [Required]
        public string ShoeSize
        {
            get;
            set;
        }

        // Remember to stay pragmatic about this. For example, I wouldn't keep the horizontal alignment for properties with multiple attributes if it got too long.
        // This also ties directly into the Principle of Proximity.
    }
}
```

### The Principle of Proximity

> Items that are close together are perceived as part of the same group​

Consider the readability between both AddAsync methods below. Which is easier to read?

```
namespace PrincipleOfProximity 
{
    public class AddressRepository 
    {
        private readonly DbContext _dbContext;
        private readonly IAddressValidationService _addressValidationService;
        private readonly ILogger<AddressRepository> _logger;

        public AddressRepository(DbContext dbContext, IAddressValidationService addressValidationService, ILogger<AddressRepository> logger)
        {
            _dbContext = dbContext;
            _addressValidationService = addressValidationService;
            _logger = logger;
        }

        public async Task<string> AddAsync_Proximity(string lineOne, string lineTwo, string city, string state, string zip, CancellationToken cancellationToken = default)
        {
            var address = new Address(lineOne, lineTwo, city, state, zip);

            var isValidAddress = _addressValidationService.IsValid(address);
            if (isValidAddress)
            {
                _dbContext.Addresses.Add(address);
                _dbContext.SaveChangesAsync(cancellationToken);

                _logger.LogDebug($"Address of {address.ToString()} was added.")

                return "Saved address successfully.";
            }

            _logger.LogWarning($"Address of {address.ToString()} was not saved successfully.");

            return "Address was not valid - unable to save address.";
        }

        public async Task<string> AddAsync_NoProximity(string lineOne, string lineTwo, string city, string state, string zip, CancellationToken cancellationToken = default)
        {
            var address = new Address(lineOne, lineTwo, city, state, zip);
            var isValidAddress = _addressValidationService.IsValid(address);
            if (isValidAddress)
            {
                _dbContext.Addresses.Add(address);
                _dbContext.SaveChangesAsync(cancellationToken);
                _logger.LogDebug($"Address of {address.ToString()} was added.")
                return "Saved address successfully.";
            }
            _logger.LogWarning($"Address of {address.ToString()} was not saved successfully.");
            return "Address was not valid - unable to save address.";
        }
    }

    public class Address 
    {
        public Address(string lineOne, string lineTwo, string city, string state, string zip)
            => (LineOne, LineTwo, City, State, Zip) = (lineOne, lineTwo, city, state, zip);

        public string LineOne { get; set; }
        public string LineTwo { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Zip { get; set; }

        public override string ToString() => $"{lineOne} {lineTwo} {city} {state}, {zip}";
    }
}
```

## Some Notes

As with everything, be pragmatic with the principles you apply to make your code clean. Sometimes, there's good reason to break from these and I'd be wary of
anyone trying to apply a hard and fast, black and white rule to make these into "coding standards".

Read Part 3 [here](https://bensampica.com/post/cleancode3).
