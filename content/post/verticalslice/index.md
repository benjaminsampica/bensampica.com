---
title: Vertical Slice Architecture
subtitle: Simplicity is essential
summary: A different approach compared to a dominating architecture in our industry - Clean Architecture.
authors:
- ben-sampica
tags:
- Software Craftsmanship
date: '2021-10-25T00:00:00Z'
lastmod: '2021-10-25T00:00:00Z'
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction

I've been following the Clean Architecture principles for years. A year and a half ago, I watched a [presentation by Jimmy Bogard](https://www.youtube.com/watch?v=SUiWfhAhgQw) (of Mediatr and AutoMapper fame in the C# sphere) where he demonstrated an architecture that he's gravitated toward time after time and that he has had great success with. 

It's called Vertical Slice Architecture (VSA) and I have really started to embrace it as the go-to way I organize my work.

## The Theoretical

If you're unfamiliar with Clean (also known as Hexagonal, Ports and Adapters, Onion) Architecture, chances are you're familiar with its principles. 

### Principles of Clean Architecture

{{< figure src="images/1.PNG" title="Clean Architecture" lightbox="true" >}}

**Monolithic in approach** - Because of the way the system is structured, like an onion, it’s monolithic in its approach. Splitting off features/capabilities for things like scaling out can be a lot of effort.

**Mock Heavy** - Any layer that wants to talk to another layer has to be through an interface. Tests have lots of mocks or stubs created for them.

**Abstractions Upon Abstractions** – Repository pattern, Service pattern which leads back to rigid rules appearing on how code must flow e.g. controllers MUST talk to a service which MUST use a repository.

**Heavy Coupling Inside Layers** - Heavy coupling within a layer, light coupling between layers. Code is organized by its function rather than what form it needs to take.

I'm not going to go too heavy into Clean Architecture as it has been covered extensively, exhaustively, for years by many people much smarter than I. I encourage you to google around.

### Principles of Vertical Slice Architecture

{{< figure src="images/2.PNG" title="Vertical Slice Architecture" lightbox="true" >}}

**Use-case Driven** - Because the system is built along a slice, the system is structured around its features and capabilities. Splitting off features/capabilities for things like scaling out is less difficult.

**Melting Abstractions** - There are no gates or barriers across layers - everything needed for the system to do something is included in the slice itself where possible.

**Axis Of Change** - Along with melting abstractions, a core tenet of vertical slicing is a belief that *things that change together should be near each other*. Whenever a feature is added, removed, or changed the things that change should not be scattered all across the code base.

Because of these principles you may see the some benefits emerge:

1. Code is largely added rather than changed
2. There are fewer side effects
3. Incremental refactoring is a lot easier
4. Scaling out is a lot easier
5. Less paralysis surrounding change
6. Common language spoken with business and understanding of how the software is used
  - Because you're thinking in terms of _use-cases_, talking in terms of the domain and problem being solved is reinforced all the way from concept to cash.

However, in my experience there are also some pitfalls that make vertical slicing more difficult:

1. Requires domain design skills and feature decomposition
2. If you're framework/language is opinionated **against** feature grouping
3. Framework/language not conducive to higher-order tests like integration and end-to-end tests.
4. Like many things – don’t treat VSA as a golden hammer

## The Practical

### Clean Architecture

Let me be clear before I jump into this - my experience using Clean Architecture has been positive. Architectures serve a purpose, namely to support the constant changes in the code base, and *Clean* is no different.

That being said, I've had my own personal experiences with Clean and, with that, I've had some hangups with it that bother me.

1. Methods, through interfaces, which are used horizontally across the application.

This is not necessarily unique to Clean but I've seen many a developer fall into this trap of, in the name of keeping code DRY, share methods across various use cases. 

I’ve seen a lot methods with booleans that change the behavior of the method entirely. Especially services close to the repository (give me users ordered by a certain column, give me users who are inactive, etc.). Because these are used by so many things they are effectively impossible to change without huge amounts of effort – even with tests in place.

2. Lasagna Services

Services calling services calling services calling services… The layers of indirection from interfaces are extremely hard to mentally keep track of and debug.
Horizontally used methods leads to this service soup where you’ll have “business” services dealing with business logic, data services for different ways of grabbing data, throw in a repository layer. Your business services call other business services and data services, whose business services also call other business services and data services, etc. 

3. Lots of time navigating the file structure of the application 

When I do go to make a change, I have to flip between a multiple different folders and files to make changes in a dozen different places. 

{{< figure src="images/4.PNG" title="Adding a feature to Clean Architecture" lightbox="true" >}}

4. Easy to write low-value tests which are brittle

I'm not a fan of asserting mock calls and that's primarily where I feel that the brittleness comes from - “Does service A call service B”. This tells us very little most times and, as a twisted knife, it again causes a lot of paralysis when we do want to refactor code because now all our tests break. The interface changed, we aren’t importing this service anymore inside the constructor, etc. All these tiny little breaks all the time for the simplest of stuff. It’s not that the tests no longer pass – the code most times wont even compile because of these breaks. These types of breaks aren’t inherently bad, don’t get me wrong, but it’s the latitude of these since they’re horizontally sliced that makes this a pain in the ass. 

5. Hard to approach modifying or adding new features because of the coupling 
 
Makes understanding the “why” of the system very hard. To the last point, when you have tens of thousands of tests and hundreds of them break because of an interface change – people will work around doing so. This is manifestation of people being unwilling to make these changes can be a side effect known as [Conway's Law](https://en.wikipedia.org/wiki/Conway%27s_law).

6. Lots of worrying about side effects

Again, because everything is vertically sliced there's lots of worry around breaking existing things - even with tests. I’m in constant fear of breaking something unrelated. This is my #1 thing that keeps me up at night crying into a pillow.

### Vertical Slice Architecture

In contrast as you begin vertical slicing you'll notice some patterns emerge. 

#### Emergent Patterns

1. Command Query Responsibility Segregation (CQRS)

Having your applications reads (think displaying a list of orders) separated out by writes (think placing an order) is a big aspect of vertical slicing because, naturally, your code is split by use-case. 

2. Domain-Driven Design (DDD)

Because your code is organized by feature building a domain model ends up emerging more naturally.

3. Higher-Order Tests

Because you're slicing vertically, the boundaries for your tests become a lot more clear and, language permitting, you can write integration and even end-to-end tests with little mocking or stubbing things that are unrelated to the feature at hand.

4. Group by Feature

Integration tests can become a lot easier with vertical slicing because of the heavy coupling within a slice. Additionally, following the belief that things that change together should be near each other, code should be placed physically near each other when possible. What this allows is an easier time switching out implementations depending on the need.

{{< figure src="images/3.PNG" title="Group By Feature" lightbox="true" >}}

Some languages and frameworks are less opinionated on their structure but this follows the principle of keeping things related by feature to each other close and things unrelated to that feature far away because **things that change together belong together.** 

{{< figure src="images/5.PNG" title="Left - Clean Architecture | Right - Vertical Slice" lightbox="true" >}}


## Some Notes

Further your mastery with some additional material -

- [Organize Code by Feature | Vertical Slices](https://www.youtube.com/watch?v=PRns0rqPonA) – YouTube (Derek Comartin)
- [Vertical Slicing in Agile – Book (TJ Rerob)](https://www.amazon.com/Vertical-Slicing-Agile-software-development/dp/B0975YMGD9/ref=sr_1_1?dchild=1&keywords=Vertical+Slice+architecture&qid=1631049021&sr=8-1)
- [VSA – C# GitHub Repo (Jimmy Bogard)](https://github.com/jbogard/ContosoUniversityDotNetCore-Pages)
- [Hybrid CA / VSA – C# GitHub Repo (Jason Taylor)](https://github.com/jasontaylordev/CleanArchitecture)
- [My Code Examples](https://github.com/benjaminsampica/techtalks/tree/main/VerticalSliceArchitecture)
