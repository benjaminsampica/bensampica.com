---
title: 'Test-Driven Development: The Video Game'
subtitle: NOW ON STEAM!
summary: Explaining Test-Driven Development through the lens of a video game.
authors:
- ben-sampica
tags:
- Testing
date: '2020-08-10T00:00:00Z'
lastmod: '2020-08-10T00:00:00Z'
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction

A coworker and I recently presented this at our bi-weekly technical talk internally and I thought I'd share it as well.

The reasons for Test-Driven Development (TDD) are many - it helps a team maintain sustainable pace (an agile principle), it reduces cycle time when a bug arises,
it provides code-as-documentation, helps create designs that conform to coding principles, makes refactoring a lot easier, [and on and on and on](https://www.madetech.com/blog/9-benefits-of-test-driven-development)...

But how do we drive our development with tests?

## The Theoretical

### Test-Driven Development: The Video Game ($59.99)
In stores now, or available on [Steam](https://www.youtube.com/watch?v=oHg5SJYRHA0).

**Cover Art**
{{< figure src="images/cover.jpeg" title="Test-Driven Development: The Video Game" lightbox="true" >}}

### Roles
Ideally, you have two players, one who plays the role of the _Forces of Order_ and one who plays the _Forces of Chaos_. If possible, physically pass the keyboard to the other player when your role is not in play. If you're practicing this by yourself, try and switch mindsets by doing something like putting on a hat (or changing it), changing VS color schemes, or sitting in a different position.

#### Forces of Order (<i style='color:red'>red</i>)
- Writes the test that brings 'order' to the application by placing constraints on the application from the business rules.
- The test will fail because the production code is not yet written.

#### Forces of Chaos (<i style='color:green'>green</i>)
- Writes the **_minimum_** amount of production code to make the test pass.
  - We're serious, the minimum. Chaos is only concerned with getting the test to the green state.
- "Quick and dirty" is okay here. We want to make our cycle time from red to green as short as possible.

#### Forces of Harmony (<i style='color:cyan'>refactor</i>)
- Both forces of _Order_ and _Chaos_ come together to refactor the production code that was written.
- Immediately commit the code - we want to be able to walk back any further changes in case things go in a direction _Harmony_ doesn't like.
- Because the test is green, changing the quick and dirty solution into a clean and elegant solution is really easy. The test can be rerun to make sure it still (and other tests) does what we programmed it to do.
- Don your original hats, themes, or sitting position and move to the next item.

### Hints
- The cycle time can be as low as _seconds_. The lower, the better!
- Switch roles for double experience point gains.
- Taking larger steps is okay when you're comfortable with what you're doing.


## The Practical

View the repo [here](https://github.com/benjaminsampica/bensampicaPostExamples/tree/master/tdd). The problem domain is simply the `FizzBuzz` common problem. Can you test drive a similar solution?

### Lore

Our business needs some way to determine if a given number is a just a simple number, is capable of being Fizz, is capable of being Buzz, or if it's a grand slam and is a complete FizzBuzz.

### Bosses
- Print the numbers 1 to 100.
- If given a number divisible by three, the program should return the word "Fizz".
  - 3, 6, 9, etc.
- If given a number divisible by five, the program should return the word "Buzz".
  - 5, 10, etc.
- If given a number divisible by both three and five, the program should return the word "FizzBuzz".
  - 15, 30, 45, etc.
- Otherwise, just return the number itself.
  - 1, 2, 4, 6, etc.

### Loot
- Experience Points
- Tower Shield of Test Coverage
- Platemail of Dexterity
- Barbute of Foresight
- Boots of Velocity
- Sword of Insect Slaying + 1
- Legendary Scroll of Code Documentation

## Some Notes
It's absolutely okay to walk into TDD instead of run. By that, I mean write your production code first and then write your test. After all, having tests is always better than no tests at all. When you're comfortable, try swapping the order that you do them in to train your mind to think about the problem from the opposite angle. Using techniques like writing out a list of test criteria before actually writing any code at all tends to help me visualize what needs accomplished.