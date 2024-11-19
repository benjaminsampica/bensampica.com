---
title: 'Clean Code - Part III: Comments'
subtitle: To comment or not to comment, that is the question.
summary: Identifying some examples of common patterns and anti-patterns with comments.
authors:
- ben-sampica
tags:
- Software Craftsmanship
date: '2021-03-09T00:00:00Z'
lastmod: '2021-03-09T00:00:00Z'
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction

> If you don't have time to do it right - you never had time to do it at all
> <br/> - Robert Martin

Comments are a integral part of documenting your code. However, when and where to include an comment can be confusing - example code often is over-documented in order to convey meaning without the entire context. On the other hand, in my personal experience, production code often has no comments at all or, equally as bad, every single line is commented.

Clearly, there's somewhere in the middle that can convey important information without being overwhelming but also without being entirely absent from code -  leaving people guessing as to why the code does what it does.

## The Theoretical

There's a few things we have to consider before we ever put our fingers on the keyboard to write a comment. 

> Comments decay exponentially faster than live code.

Editors treat comments as simply words on a page. When we include method names, variable names, etc. inside of comments, they have a lot higher chance of not getting changed with code. Errors and warnings aren't thrown for comments. They will sit idly by and go stale and your code will still technically work.

 This is a common occurance when we lean on our IDE's to do code refactoring (which is good), such as renames or restructuring lines of code. Some IDE's like Visual Studio _do_ include an option to rename strings as well so keep an eye out for when that's appropriate.

> Don't write comments - rewrite your code.

If you find yourself writing a comment in order to explain what your code does, take a second look at it. Better yet, grab a coworker and have them take a look at your code and see if they can interpret its meaning from what you've written. 

Express your intent by having clear variable and method names, as well as breaking out long methods into shorter methods. 

> Stale or bad comments can be more damaging than no comments at all.

The second the code around the comment changes, the comment is actually doing more harm than having no comment at all. Imagine buying an office desk and all the instructions are wrong on how to put it together - in the end you would have spend more time building it with bad instructions rather than if you had just tried to do it on your own.

## The Practical

### When to Avoid Commenting

There are some easy concrete anti-patterns we can avoid when we write comments.

> Commenting everything

I've fallen into this trap personally for a short while - believing that documenting everything was, in fact, an _enlightened_ way to code. Almost every single line had a comment, every method a summary, every internal property a description. This wasn't an API that would be publicly available for anyone to just walk into. It was a tight-knit team of three developers with a lot of contextual understanding.

_It was exhausting to keep it up._

I found myself spending a significant amount of time just making sure the comments matched the code. All of that time spent keeping up comments versus _actually_ writing code - not actually delivering value.

> Version history in a file

Git does versioning better so avoid change mausoleums inside of files. This is a lot more common in older repositories before version history existed or was adopted by the organization. Don't be afraid to move these into a git repository and delete the comment history inside the file. Those vague change descriptions from when the original _Terminator_ was in theaters aren't going to come in handy.

> Conversation in code

``` // Bob please fix this before 3/11. ```

Someone just should've went to spoke to Bob directly. These aren't useful and just serve as clutter. Email, private message, or better yet go to Bob's desk and speak to him directly about whatever you need them to do. Remember the first value of Agile, [Individuals and Interactions _over_ Processes and Tools](https://www.dummies.com/careers/project-management/applying-agile-management-value-1-individuals-and-interactions-over-processes-and-tools/).

On that same vein...

> TODO's that end up being TODON'Ts

Seeing a lot of these that live a long time can be a small part of a larger problem. Be introspective as a team as to why these can’t break out of your code and materialize into cards to pay the technical debt that these are incurring.

> Dead/Orphaned code

Production code that has been commented out serves little purpose other than to confuse and waste the reader's time. Remember from my first [blog post](https://bensampica.com/cleancode1) that code will be read more often than it was written. 

If the code gains value suddenly and you’ve deleted it, you can always pull it out of git. Don’t let it sit commented out though because then it’ll _never_ get deleted. Nobody remembers its original intent and everyone becomes too afraid to remove it. You believe that _someone_ else owns that commented out code but the reality is _everyone_ feels that way but nobody actually feels ownership over it. 

> Comments clarifying something when a good name would be better

As mentioned earlier in this post and in part one - rewrite the comment right out of the code.

### When to Add a Comment

On the other end of the spectrum, there are things that happen to our code that we should always comment.

> Hacks are required or quirks with behavior

Something may be unique about the environment the code is deploying to, the service that calls the code, etc. When you write code that breaks the expectations of other developers and at first glance may seem funky, leave a comment.

> Open GitHub/GitLab/etc. issues

We depend on external sources like NuGet.org and its countless libraries to make our jobs easier. Naturally, as technology changes so do these libraries. Breaks between what a library does and what it should be doing form across these external dependencies and they stop playing nice with each other occasionally. These are natural TODO's in your code and should include the link to the github issue in the code as well to resolve when the issue is handled.

> It is a public API that is consumed by an external resource.

This doesn't mean outside your company - just that the internals of the code are not visible within that users codebase. Developers create NuGet packages and Web API’s to share code and data flows to other people to help them go faster – and then subject them to undocumented interfaces that undermine the help that was supposed to be provided. 

 Help people fall into what is known as a pit of success. Make your code easy to use correctly and hard to use incorrectly. This is where documenting every publicly available property, method, etc. and a good README really shine. 

It is downright *mean* to exclude this help.

## Some Notes

Along with comments, another great way to document your code is through writing automated tests. [There are a laundry list of benefits for doing so...](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)

{{< video src="videos/comments.mp4" controls="yes" >}}