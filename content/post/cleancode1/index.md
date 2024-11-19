---
title: 'Clean Code - Part I: What’s In A Name?'
subtitle: Naming is hard, but why?
summary: Offering some tips on how to name things so other people, including yourself at a later date, can understand it.
authors:
- ben-sampica
tags:
- Software Craftsmanship
date: '2020-09-20T00:00:00Z'
lastmod: '2020-09-20T00:00:00Z'
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction
I recently just finished [Implementation Patterns](https://www.amazon.com/Implementation-Patterns-Kent-Beck/dp/0321413091) by Kent Beck. Kent is an icon in the programming community - one of the pioneers and signers of the Agile Manifesto - among other things, [like writing one of the first books on Test-Driven Development way back in 2002](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530). In _Implementation Patterns_, he writes about how even the tiniest decisions have an impact on the software we write and he offers guidance on how to implement these decisions. One quote in particular struck me -

> The code you write will be read more times than it was written and by more people.

I've read [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship-ebook/dp/B001GSTOAM) by Robert Martin, who also offers excellent advice, but this sentence was concise and striking. It is why we struggle with naming things when programming, whether it be variables, methods, properties, or even going further and arguing with the business on why _their_ naming conventions are confusing.

So, why _is_ naming things so hard but so important?

## The Theoretical
There are quite a few reasons covered in the above books, which I recommend you read, but the following section is broad strokes of what I took away from them. The overarching theme is writing code that is _concise, readable, and consistent_.

### Limiting Concepts
As your software grows over time the number of problems your software solves increases. First, the business just wanted a table view of some users. Next, they wanted to be able to manage users' information. Now, they're coming back and they want you to write a report procurement piece for the user information.

Limiting the number of vocabulary words needed to understand what the application does is important for both developers _and_ when speaking to the business about the application. Is it user _profile_ or user _information_? Is the feature a _table_ or a _list_? These concepts mean different things to different people. Hell, if enough time has passed, sometimes these concepts will mean different things _to the same person_. Thus, it's important to solidify what you're actually speaking about in your code and at the table with the client.

There should be some hand-wringing over introducing a new conceptual idea in your code because it means your mental model, what you need to keep track of at all times when developing, just increased. Be _concise_ in your concepts. Design patterns are a great way to instantly share that understanding, at least among developers.

### Being Kind to Others (And Your Future Self!)
Be kind to others, and your future self, by making sure that the language you use communicate your concepts in your code is _consistent_. If you choose to say a `UserProfile` class has a property called `userId`, don't name your variables that hold reference to this property `uId`, `userID` or `userIdentifier` - stick with `userId`. Stop thinking that the shorthand "saved you time". It doesn't. It confuses the hell out of everyone else _and_ yourself six months down the road.

**Don't be clever, be consistent.**.

A good rule of thumb is to not shorthand anything unless it's a commonly understood acronym.

One exception to this rule of consistency is one I brought up earlier - bad naming conventions the first time around. If mistakes were made in the past on naming conventions, it may be time to introduce your own locally. A notable pain spot is legacy database column names (for example `txtUsInfUsIdInt32`, which probably saved a ton of time and sense before strongly-typed, object-oriented languages really took off). It would be appropriate to locally say `UserId` to not keep carrying forward the naming convention.

The code we write _must_ be human-readable. Anyone can write code so that the machine understands it - the machine often compiles your code into a form it can read (often even more unfriendly to a human).

**Thoughtful, kind, and professional developers write code that other humans can read.**

### Good Design
By trying to stick with good naming conventions that are clear and concise, you may find yourself struggling with really _looooooong_ method names. It's great that you're trying to explain what your method is doing but something just doesn't feel right. Perhaps your method is really hard to name because it is simply [_doing too much?_](https://en.wikipedia.org/wiki/Single-responsibility_principle)

When you find yourself having a hard time naming something, consider breaking it out into multiple methods. A good rule of thumb is try explaining what the method does to yourself and every time you say _and_ as well as _or_ consider if it's the appropriate spot to [extract the method.](https://refactoring.guru/extract-method)


## The Practical
I've written a lot of bad code in my time - code that I _know_ the person now maintaining it is looking at the commit history and cursing my name.

As Kent's principle states, however, I've read even more bad code.

I figured I'd share a few examples of these experiences from both ends.

### I Do Work

```
public void DoWork()
```
This one came into my lap recently and I honestly found it hilarious once I thought about it for a while. Imagine a friend asking you what you do for a living. "I do work", you respond. Imagine his or her face at your response. They'd probably think you were being sarcastic or being a jerk. Literally every occupation _in the entire world_ does work, from the street sweepers all the way to the CEO of Amazon. The intentions of this method, what it _actually does_, is probably least clear I've ever read. It made no attempt to tell us what it does and is impossible to discern from the name. I'd compare it to receiving a variable of type `object` whose name is simply `aVariable`. How confusing!

### Getting And Finding

```
public IEnumerable<User> GetUsers()
public IEnumerable<User> FindUsers()
```
I can see how this one would happen but I'd consider it a mistake of the second developer (confession: it was me) who didn't check first what the convention already was in the code. I like to prefix _Find_ when the possibility of the returned item can be null or empty. Likewise, I like to prefix _Get_ when the possibility of the returned item will always be fulfilled (barring exceptional circumstances, of course).

This preference comes from [lots of googling around](https://www.google.com/search?q=find+vs+get&rlz=1C1CHBF_en&oq=Find+vs+Get) and my personal agreement to the argument that asking someone to "find" something (say, a tool in the garage) has the understanding that the tool could be misplaced. Asking someone to go "get" something has a more concrete understanding that the tool is there and it only need retrieved. Obviously, this only makes sense in some locations and your perception may differ but I've found it an apt example.

### I No A Num and Number

```
accountNo
accountNum
accountNumber
```

I've seen this in various different formats but my favorite (/s) was in an accounting system. Variable names, signature parameters, and properties all varied by who wrote the code. This project was the perfect storm for this sort of issue - it had no review code review process, it had multiple developers, and there was significant skill and experience differences between developers. Some were COBOL guys and some were brand new. Ultimately, it made it really hard to make _certain_ that the variable or property you were wanting was actually what _you_ expected.

## Some Notes
This is the first part of many that will dissect what makes code universally good to others. Ultimately, remember that the code you write must be clear to _everyone else_ who will read it, not just yourself (in that moment). Try grabbing a coworker and having them critique what you've written to make sure you both understand it. A few minutes today will save hours of discerning meaning later.

Read Part 2 [here](https://bensampica.com/post/cleancode2).

_Don't be that guy who writes bad code_.

{{< figure src="https://i.redd.it/1gt5kb38ubo51.jpg" title="" lightbox="true" >}}