---
title: Automated Testing with Food
subtitle: ''
summary: ''
authors:
- ben-sampica
categories:
- Software Craftsmanship
date: '2024-01-29T00:00:00Z'
lastmod: '2024-01-29T00:00:00Z'
featured: false
draft: true
toc: true
---

{{% toc %}}
# Introduction

Watching too many cooking shows (the bear)

Id just call it automated tests. Unit has some connotations and limitations (and least to engineers).
Let me frame it in the way of crafting food, say at a fancy restaurant. Apologies in advance for the wall of text.
Creating a new dish that we want to serve to our customers requires a lot of trial and error, but ultimately we have two things at the end of it. A recipe for it (the behavior we are testing) and the great food (all the tests pass). In our case, when we craft the receipt there is a lot of tasting it to make sure it’s all coming together correctly (the tests). There is either good food (the passing “green” tests) or the food is garbage (any failing “red” test). No in between.
To be clear, all our recipes at our restaurant are hand-crafted (we write all our tests ourselves). We use quality ingredients (tools, frameworks, etc.) that we know we can rely on so we don’t test the flour to make sure it’s the right blend of starches, we know it is flour.
Sometimes, we retire recipes when we no longer want to serve them (we delete the behavior and the tests associated with behavior).
Sometimes, we craft some food to have a greater understanding of how to work with that food and how it blends with other foods, but ultimately throw it out. For example, if we already know how to bake broccoli but want to bake cookies, we’ll bake cookies with broccoli in it to learn how to start making cookies. We will write tests, then use those tests to write other tests and delete the original tests - nobody wants or needs broccoli cookies.
Okay, lots of build up here so I hope I haven’t bored you to death.
When we’re done creating the food, we put it on the warm waiting area (a pull request) for the waiter to inspect and make sure it’s correct before picking it up (other developers approve the PR).
When someone orders food and before we bring it to them (ship to production), we actually test _every_ recipe in our entire shop to make sure by making that dish, we haven’t just ruined some other dish. The door out of the kitchen will not open for the waiter until we are assured that we haven’t broken another dish (the code MUST build and the automated tests MUST pass).
We test the entire menu automatically, every time.
To give a brief definition of our different types of testing, in the form of food, this might help.
Business orders steak with fries and a strawberry milkshake.
Some unit tests would be:
- the strawberries are fresh
- the uncooked meat has no brown spots
- the fries are waffle cut
Some integration tests (higher order than unit) would be:
- the ice cream blends well with the strawberries we chose
- the steak cooks evenly on our flat top
- the oil we used in the fryer compliments the waffle fries
Some system tests (higher order than integration) would be:
- the entire dish together looks pleasant to the eye
- the plate we chose is large enough for all the food we’re serving
- each item on the plate, after being eaten, flows well with the next item I eat.
