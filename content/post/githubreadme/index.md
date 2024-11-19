---
title: GitHub readme + Dungeons & Dragons
subtitle: Roll For Initiative!
summary: Creating a personal GitHub readme that "plays" Dungeons & Dragons
authors:
- ben-sampica
tags:
- JavaScript
- DevOps
- DND
date: '2020-07-14T00:00:00Z'
lastmod: '2020-07-14T00:00:00Z'
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction

Like many of my stories, I saw a post on Reddit showcasing a special 'hidden' feature that GitHub had added to their users' repository list - the ability to make a *personal* readme that displays on the front page of your GitHub.

Check out some awesome examples [here](https://github.com/benjaminsampica/awesome-github-profile-readme)!

## The Theoretical

There isn't much to say. I'm super into Dungeons and Dragons (DND, D&D) and decided I'd make my profile page a Initiative Roller. If you aren't familiar with D&D, whenever combat starts in the game for the first time, everyone engaged in the fight "rolls for initiative". All participants, friend or foe, roll a 20-sided dice (D20) to determine who takes the first turn. Depending on your class, race, or equipment, you may add or subtract from this number.

I followed the examples I linked above as well as the [GitHub documentation](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action).

## The Practical
You can view my creation [here](https://github.com/benjaminsampica/benjaminsampica).

I used JavaScript backed with some node module libraries to do the heavy lifting. Since I wanted to persist people's class choices and their roll counts as part of the fun, I implemented text files which act as a database of sorts.

Part of the charm of the personal readme was being able to use Actions, GitHub's CI/CD workflow. Whenever someone chooses a class on the readme and submits the issue, the following happens inside [my Action workflow](https://github.com/benjaminsampica/benjaminsampica/tree/master/.github/workflows):

- Checks out the repository.
- Runs a git pull on master to handle concurrency issues with other running workflows
- Rolls for Initiative
  - [Send the title of the issue and the user to this action.](https://github.com/benjaminsampica/benjaminsampica/blob/master/.github/workflows/readme.yml#L13-L18)
  - [Reads the current database file values.](https://github.com/benjaminsampica/benjaminsampica/blob/master/roll/index.js#L63-L64)
  - [Determines, based on the users' chosen class, the initiative bonus and rolls the dice.](https://github.com/benjaminsampica/benjaminsampica/blob/master/roll/index.js#L68-L69)
  - [Updates the database counters for both class and roll.](https://github.com/benjaminsampica/benjaminsampica/blob/master/roll/index.js#L68-L69)
  - [Regenerates the entire README file with the new count values. Also sticks the last roller name on there too.](https://github.com/benjaminsampica/benjaminsampica/blob/master/roll/index.js#L75-L89)
  - [Physically writes the new files.](https://github.com/benjaminsampica/benjaminsampica/blob/master/roll/index.js#L91-L93)
- Commits the changes.
- Pushes the changes to GitHub.
- Closes the issue that was opened by the user for the class chosen.

Yes, it's not the most efficient or beautiful thing - everything being inside one file bugs me a bit - but it was such a short-lived and fun breakable toy that my drive to refactor it is low.

## Some Notes
Check out the [GitHub Actions](https://github.com/features/actions) pages and write your own!