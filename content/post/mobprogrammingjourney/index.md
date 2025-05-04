---
title: My Mob Programming Journey
subtitle: Embracing the mindset that "learning is the work"
summary: Starting in 2019, I unknowingly embarked on a journey that led me to lead the most productive software development team I have ever worked on.
authors:
- ben-sampica
tags:
- Mob Programming
date: '2025-05-05T00:00:00Z'
lastmod: '2025-05-05T00:00:00Z'
featured: false
draft: true
toc: true
---

{{< toc >}}

## Introduction

> Learning is the work.

I first heard these words from [Allen Holub](https://holub.com) on LinkedIn sometime in early 2019. It was speaking of software development as a whole; that the _primary_ objective of a software developer is to _learn_. To learn to write software, learn to problem solve, learn to communicate, learn your domain, learn your client's actual needs - better. I had no idea then how these words would imprint on me as I read them.

At this time, I was working for Polk County in the state Iowa in a mid-level engineer position. It's the largest county in Iowa but still only had about ten developers total. We developers worked in complete silos with the work coming from three or four "product" people. At any given time a developer would have two or three ongoing workstreams from one or more of these people. It's incredible anything got done and if you think it was very wasteful you'd be right 🤣.

## 2019

Soon thereafter, I gained an outsized interest in improving myself by [buying books](https://www.bensampica.com/library), joining many Reddit subreddits, and [posting on StackOverflow](https://stackoverflow.com/users/5000776/ben-sampica). The first book I ever read was [Joy Inc.](https://a.co/d/aKAWB18) which is coincidental because it's not a traditional software engineering book at all. This book laid the groundwork for what comes later though I didn't know it at the time.

At this time, I had no kids and so many nights and weekends were spent consuming and participating in all this media and writing small apps. I made a lot of bad design decisions I never had to actually live with (but plenty of things I learned) like an over-engineered website for [district supervisor election](https://web.archive.org/web/20190109213614/https://angelaconnolly.org/) and a website for a video game team that [never released](https://www.mmorpg.com/zy-universe). 

I also created a website for myself as an always-online resume and then quickly added on a blog. I wanted to track my own progress, improve my writing skills, and have something to show others (it seems to help when looking for jobs). My first daughter Piper was born at the very end of 2019 and here's a picture of us and our dog Percy. I think we're reading _[The Pragmatic Programmer](https://www.amazon.com/gp/product/0135957052)_.

{{< figure src="images/2019.jpg" title="My daughter Piper and I weeks after she was born reading a book with our dog Percy." lightbox="true" >}}

I learned about pair programming from these books so I tried it out at work.

At my workplace at the time I would try and pair with other developers (about 9 total) but it never really stuck for various reasons. Looking back on it, it was mainly a combination of the culture (everyone had their own work and command/control leaders), the environment (we had very tight cubes which made it physically hard), and we were simply just bad at it (watching versus actual collaboration). I learned from all my efforts at home that it felt _really good_ and _fulfilling_ to improve myself. Even though we totally _sucked_ at collaborating that feeling was multiplied when I helped others no matter how bad it was! 

## 2020

COVID-19 needs no introduction but this event is the one that I can single-handedly point to and say that it is _the event_ that I boarded the "mob programming" train. Though I had no idea what "mob programming" even was at the time, it began on March 16th (Monday) when our workplace told us to remain at home over the weekend. Even though all of us developers were bad at truly working together we were friends nonetheless. In order to keep seeing each other a core group of us who were closest decided we would gather at one person's home. 

Naturally, nobody has a home office that can accomodate 4 other people at it so we hooked up all of our stuff at their kitchen table. Unfortunately I don't have a picture but imagine a bunch of laptops hooked up to monitors and computer equipment everywhere, nerds sitting on uncomfortable kitchen chairs hunkered over keyboards, like an early 2000s LAN party.

I don't even remember who said it now once it was all setup but once spoken we all giggled - it was brilliant.

> Megadesk

This was it. We had somehow stumbled into a proto-mob even though we were all working on different things. A few things happened that I only appreciated now having to reflect back on it:

1. We had the same core group of people in the office.
2. We took these same people and changed the environment under which they worked.
3. Different behavior occured.

Here's some of the notable behaviors I remember:

1. People would just call out for help when they needed it versus waiting hours and then asking for help in Slack and (someone) eventually coming to help.
2. Even though we were all assigned our own work, "time-trading" started happening where people would work together on one thing and then in payment the other person would work together on their thing.
3. Groups of 3 or 4 would form to tackle new technical ground being broken and make decisions quickly.

Why? I believe the following:

1. Proximity. We were all so close to each other that it was impossible not to collaborate.
2. We were all friends, we were in one of our own homes, and thus it was a very safe environment. It was finally okay to verbally swear at misbehaving code and it was okay to ask for help where you weren't potentially being viewed as "interrupting someone else".
3. Taking breaks when we felt like it.

This lead to one simple truth. **We felt energized even at the end of the day.**. There was _joy_ in the work just beyond getting the work done. We completed a lot of things and _had fun doing it_.

We all agreed after the very first day we had created something special. We set up a meeting with our two-up to convince him to let us bring "Megadesk" back to the office - to restructure the cubes or take over a conference room or something. We also wanted to realign the teams into what was commonly known as "product" aligned teams. He was agreeable and we made plans for when we returned to the office when all this COVID stuff blew over in a few weeks.

Obviously, that didn't happen. 

Eventually, the commute to our friend's house wore thin (it was nearly 40 minutes for some of us) and my wife was coming off maternity leave so I needed to be able to pick up Piper from daycare. Thus, "Megadesk" physically died but its soul lived on brighter than ever in me. However, we still did align into product teams and even though we weren't physically present we still desired what we had when we were all working together. So, we satisfied this desire by starting a group call and then someone would volunteer to "drive" and that person would share their screen. 

You might think this inefficient but we were writing code that we considered very high quality, with automated tests (which were relatively new to most of us), and shipping it to production faster than our product person could physically attain work given the constraints of COVID at the time. Because there was _joy_ in working together we started refactoring all our existing projects to bring them up to our (new) standards too. Nobody told us to - we just did it because being together and doing it together was _fun_.

Unfortunately, there isn't much opportunity to move up in a government job without someone else above you leaving. I left Polk County in the fall of 2020 and took a role as a senior developer at Homesteaders Life Insurance. I was very worried I would go back to the "old way of working".

## 2021

### Homesteaders
Being in the most senior position on a development team granted me some flexibility and authority in how I wished the team to work. I was careful not to force my two co-workers (an associate and an intern) into working a way they were not comfortable with but when either had questions I would pair up with them and we would solve whatever problem it was. 

Within weeks, the associate and I would pair on most things. Over the coming winter, we completely rewrote the application we were working on. Primarily, it would send images to a cloud-based OCR and then send us the text back and we would further process it. We sped up this workflow by over 5x (30+ minutes to 6 minutes which was then limited by how fast the external OCR would send us results back). The project was a huge success and we got it done way earlier than anticipated. It was also Homesteader's first application to have any automated testing - much less a full suite.

Unfortunately, I felt some hard resistance to many aspects that I read in books or even had at Polk County. For example, at Homesteaders, when an application was "finished" it would be handed off to a "run" team that would then fix any bugs or add small enhancements. This has many obvious downsides and I very much wanted to retain ownership of this application that my team had created. It was not to be.

Additionally, we suffered from our success. We were told we were going to delve into the existing mainframe (which was COBOL) and enhance portions of it for at least the next six months. I said "No", which of course didn't matter, and so I left a mere 11 months after I started.

### Comoto

I was only here 5 months as a senior engineer. I ran into a like-minded soul named [Brian Gamble](https://www.linkedin.com/in/bjgamble/) who luckily was on my team and he also shared a desire and some experience with team programming. I can't remember if it was Brian that officially introduced me to the term "mob programming" but it was around this time I discovered [Woody Zuill](https://woodyzuill.com/) who coined the term outright. My first few weeks there happened to coincide with an "transformation" the organization was putting on where they brought in [Bob "Agile Bob" Hartman](https://agileforall.com/author/agile_bob/). He was pretty good.

I didn't really see any transformation though, haha.

There was a ton of turnover at Comoto for a lot of reasons, one of which was there was a lot of turnover. The applications my team oversaw were [mysterious and important](https://www.youtube.com/watch?v=rWiekWdJUVw) - nobody remained who actually built them. Nobody remained who had even maintained them two years ago. 

A lot of misery was had in the short months I was here but our team of four found a lot of joy team programming - flailing and screaming as we tried to figure out what the hell the previous dozen people had cobbled together (or broken) before us. I like to think we were as successful as we could be with four minds rather than one. I learned here that a misery shared is a misery halved and team programming was an excellent denominator.

There is no need to go into specifics on why I left but they were numerous. 

## 2022

I left Comoto to join my current team at Casey's General Stores, a midwest gas station, as a senior engineer right at the tail end of 2022. I didn't mention this in the timeline as it was irrelevant to the beginning of my mob programming journey, but I actually worked at Casey's for about eight months at the beginning of 2019. Some aspects were good, many were bad, so I left and rejoined Polk County (which is the beginning of this post).

In December of 2022, the perception of the threat of COVID was starting to "die down" and many organizations - Casey's included - began making moves to bring folks back into the office. My first few weeks that went into 2023 began back in an office. However, since I had already 

## 2025 (Today)

I stood up from the "Megadesk" for the final time, crying and trying to hide it from Chris and Stroup, and turned to leave our shared space one last time. I bumbled out "See ya" as I exited the door, left the building, and drove home. But not before I scribbled on the whiteboard, one final time, the words that had begun this journey of mine.

> Learning is the work.