---
title: My Mob Programming Journey
subtitle: Embracing the mindset that "learning is the work"
summary: Starting in 2019, I unknowingly embarked on a journey that led me to lead the most productive software development team I have ever worked on.
authors:
- ben-sampica
tags:
- Mob Programming
date: '2025-09-15T00:00:00Z'
lastmod: '2025-09-15T00:00:00Z'
featured: true
draft: false
toc: true
---

{{< toc >}}

## Introduction

> Learning is the work.

I first saw these words from [Allen Holub](https://holub.com) on LinkedIn in early 2019. He was talking about software development at its core: the real job of a software developer is to learn. To learn how to write code, how to solve problems, how to communicate, how to understand your domain, and - most importantly - how to uncover what people actually need.  

At the time, I didn’t realize how much that idea would shape my career. But looking back, it became the guiding principle behind my growth as a developer and my journey into mob programming.  

## 2019: Beginnings

Soon thereafter, I gained an outsized interest in improving myself by [buying books](https://www.bensampica.com/library), joining many Reddit subreddits, and [posting on StackOverflow](https://stackoverflow.com/users/5000776/ben-sampica). The first book I ever read was [Joy Inc.](https://a.co/d/aKAWB18) which is coincidental because it's not a traditional software engineering book at all. This book laid the groundwork for what comes later though I didn't know it at the time.

At this time, I had no kids and so many nights and weekends were spent consuming and participating in all this media and writing small apps. I made a lot of bad design decisions I never had to actually live with (but plenty of things I learned) like an over-engineered website for [district supervisor election](https://web.archive.org/web/20190109213614/https://angelaconnolly.org/) and a website for a video game team that [never released](https://www.mmorpg.com/zy-universe). 

I also created a website for myself as an always-online resume and then quickly added on a blog. I wanted to track my own progress, improve my writing skills, and have something to show others (it seems to help when looking for jobs). My first daughter Piper was born at the very end of 2019 and here's a picture of us and our dog Percy. I think we're reading _[The Pragmatic Programmer](https://www.amazon.com/gp/product/0135957052)_.

{{< figure src="images/2019.jpg" title="My daughter Piper and I weeks after she was born reading a book with our dog Percy." lightbox="true" >}}

I learned about pair programming from these books so I tried it out at work.

At my workplace at the time I would try and pair with other developers (about 9 total) but it never really stuck for various reasons. Looking back on it, it was mainly a combination of the culture (everyone had their own work and command/control leaders), the environment (we had very tight cubes which made it physically hard), and we were simply just bad at it (watching versus actual collaboration). I learned from all my efforts at home that it felt _really good_ and _fulfilling_ to improve myself. Even though we totally _sucked_ at collaborating that feeling was multiplied when I helped others no matter how bad it was! 

## 2020: Megadesk

COVID-19 needs no introduction but this event is the one that I can single-handedly point to and say that it is _the event_ that I boarded the "mob programming" train. I had no idea what "mob programming" even was at the time, it began on March 16th (Monday) when our workplace told us to remain at home over the weekend. Even though all of us developers were bad at truly working together we were friends nonetheless. In order to keep seeing each other a core group of us who were closest decided we would gather at one person's home. 

Naturally, nobody had a home office that could accomodate 4 other people at it so we hooked up all of our stuff at their kitchen table. Unfortunately I don't have a picture but imagine a bunch of laptops hooked up to monitors and computer equipment everywhere, nerds sitting on uncomfortable kitchen chairs hunkered over keyboards, like an early 2000s LAN party.

I don't even remember who said it now once it was all setup but once spoken we all giggled - it was brilliant.

> Megadesk

We laughed, but the name stuck. We had stumbled into a proto-mob: five developers in one space, still technically working on separate tasks, but constantly crossing over. A few things happened that I only appreciated now having to reflect back on it:

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

## 2021: Transition Years

### Homesteaders
At Homesteaders, being in the most senior position on a development team granted me some flexibility and authority in how I wished the team to work. I was careful not to force my two co-workers (an associate and an intern) into working a way they were not comfortable with but when either had questions I would pair up with them and we would solve whatever problem it was. 

Within weeks, the associate and I would pair on most things. Over the coming winter, we completely rewrote the application we were working on. Primarily, it would send images to a cloud-based OCR and then send us the text back and we would further process it. We sped up this workflow by over 5x (30+ minutes to 6 minutes which was then limited by how fast the external OCR would send us results back). The project was a huge success and we got it done way earlier than anticipated. It was also Homesteader's first application to have any automated testing - but we had a full suite to boot!

We were told we were going to delve into the existing mainframe (which was 30 year old COBOL) and enhance portions of it for at least the next eight months. I said "No", which of course didn't matter (but mattered a lot to my employment status) and so I left a mere 11 months after I started.

### Comoto

I was only here 5 months as a senior engineer. I ran into a like-minded soul named [Brian Gamble](https://www.linkedin.com/in/bjgamble/) who luckily was on my team and he also shared a desire and some experience with mob programming. I can't remember if it was Brian that officially introduced me to the term "mob programming" but it was around this time I discovered [Woody Zuill](https://woodyzuill.com/) who coined the term outright. My first few weeks there happened to coincide with an "transformation" the organization was putting on where they brought in [Bob "Agile Bob" Hartman](https://agileforall.com/author/agile_bob/). He was pretty good.

I didn't really see any real change, though.

There was a ton of turnover at Comoto for a lot of reasons, one of which was that _there was a lot of turnover_. The applications my team oversaw were [mysterious and important](https://www.youtube.com/watch?v=rWiekWdJUVw) - nobody remained who actually built them. Few remained who had even maintained them two years ago. 

A lot of misery was had in the short months I was here but our team of four found a lot of joy in mob programming - flailing and screaming as we tried to figure out what the hell the previous dozen people had cobbled together (or broken) before us. I like to think we were as successful as we could be with four minds rather than one. I learned here that a misery shared is a misery halved and mob programming was an excellent denominator.

## 2022: A New Hope

By this time, I had consumed a ton of media on mob programming from the likes of Woody Zuill, Allen Holub, Dave Farley, and more as well as having had a lot of success (albeit short-lived) on teams that mobbed. I rejoined Casey’s General Stores, where I had briefly worked in 2019. Some aspects were good, many were bad, so I left and rejoined Polk County (which is the beginning of this post). This time I joined as a senior engineer with clear expectations: I valued pairing and teamwork. Notably, I didn't mention _mob programming_ at all.

### The First Day

My very first day at Casey's was more productive compared to any first day anywhere else I have worked. It wasn't anything special Casey's had done - my computer wasn't fully granted access to most things and wouldn't be for almost an entire week - but instead I pair programmed on some Azure DevOps pipelines with the team.

### The First Month

At the time, Casey's was about a year into a common retail-Agile pattern of _The Agile Transformation_. This had all the typical trappings you'd expect - rebranding of roles, top-down mandates, and more - and there were some key folks that were the "Agile" people that were big into [SAFe](https://framework.scaledagile.com/). If you know me, I strongly support that any canned framework is a bunch of baloney and ineffective in its best form.

I was a part of a "training" where these designated "Agile" folks were teaching us "Agile" in a one-hour meeting. Most of the one-hour meeting was unremarkable but as they explained through what a _Scrum Sprint_ was it was described as a "commitment". I made the mistake(?) of asking a single question about what "commitment" means. I gave an example that I'm committed to my wife, she would be upset if I asked her to commit to doing the dishes, and so I asked "What does commitment mean in our version of Scrum here at Casey's?".

After the meeting, I was sent another follow-up meeting invite from my manager and his manager (who heard second-hand) to "discuss my behavior". Whoops! I learned quickly that this was, indeed, just another puddle-deep ocean-wide implementation of Agile and that I should be more careful.

### The First Year

The team quickly discovered a lot of joy and happiness in team programming. Slowly, over the course of three or four months, the pairing turned into 3 people, turned into 4, and on until we had everyone on the team on a call. It happened organically - I didn't force anyone into it; we simply organized that way because it was fun, it was fast, and it was _good_.

We shucked a lot of the process I mentioned above. We moved away from story pointing, sprints, and really most of Scrum. It was all redundant given our speed, quality, and the fact that we were all constantly retrospecting every decision because we were all there as we made it.

I do want to call out that this year was mostly done _remotely_ due to COVID. There was and has been no discernable difference, from my experience, between in-person and remote work in its effectiveness or efficacy. The only annoying approach was if the team was split (some remote, some in office) because conversations are harder to be had when some folks are in a room and some folks are on a call. But it was still faster and better than solo working, anyway. 

## 2023 & 2024: Peak Altitude

It should be noted that these years (and 2022) were filled mostly with joy inside the team. There was plenty of gnashing of teeth and systemic/organizational pain around the way we ultimately decided to work. In retrospective, nothing stands out in my mind that was not simply political posturing, finger-pointing at us for other's teams deficiencies (in their timelines), or simply a theatre of personalities that could not put aside petty bullshit to actually do work. Ya know, typical corporate stuff.

The organization's dysfunction played to our benefit occassionally, as making decisions and executing them involved a lot of people. If folks were trying to force us to work in a way they wanted, there was a canyon of process that nobody approached. However, during these two years we did have a couple events of note:

- We lost a [great engineer](https://www.linkedin.com/in/samantha-curiel-047785152/) to another internal team due to lack of being able to promote our own from within. While extremely sad for us, a very big benefit of team programming is there was no "handing off" of work. We lost capacity and their brilliance but we did not lose the ability to deliver quality software. We brought on a new engineer and the team dynamic changed (a little). Not better, not worse. Just different.

- We moved an engineer off our team as they ended up not being a great fit after a couple years of trying everything to make it work. Another great benefit of team programming is that everyone understands everyone else's strengths and weaknesses. While this engineer did have some really great strengths, they did not align with our objectives, our goals, and our technical north stars (modernization via cloud, containers, etc..). Unfortunately, it took way too long (the process) to even move this engineer to somewhere where both the rest of the team and they were ultimately a lot happier.

## 2025: Leaving A Legacy

It was no secret on the team that I had been [moonlighting a company for a while](https://blueprint.software) and that my time was coming to a close. I was proud of what _we_ had built in the years that I was on the team. I was happy of the things I had learned from those I worked with, both teaching them and being taught by them. I think had we been given more autonomy (including our manager who was also lacking in autonomy), we would have made a couple more big changes regarding engineers, but that is the only regret that comes to mind as I write this.

On the last day, I stood up from the "Megadesk" for the final time, crying and trying to hide it from my team, and turned to leave our shared space one last time. I bumbled out a "See ya" as I exited the door, left the building, and drove home. But not before I scribbled on the whiteboard, one final time, the words that had begun this journey of mine and that I spent three and a half years repeating to my team.

> Learning is the work.

It remains to be seen what kind of legacy the team can carry forward with regards to mob programming. I'm not selfish enough to call it _my_ legacy - it was _our_ legacy. Just like when we lost engineers when I was on the team and the team reshaped, so too will they reshape around the empty chair I left. Perhaps, in a few years, it'll warrant another post to see how it's all playing out.

## Final Thoughts

From a kitchen-table LAN party in 2020 to a fully remote high-performing mob in 2025, my journey has shown me one truth: the best teams aren’t just writing software. They’re learning constantly - together. "Neurons that fire together, wire together", so the old [Hebbian adage goes](https://en.wikipedia.org/wiki/Hebbian_theory).

Mob programming isn’t about efficiency hacks or process compliance. It’s about creating environments where learning is inevitable and joy is found in the work itself.  

And that’s why I believe, now more than ever: **learning is the work.** 
