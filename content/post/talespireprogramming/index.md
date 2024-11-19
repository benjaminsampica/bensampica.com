---
title: 'D&D + Programming = <3'
subtitle: With the holiday spirit - these are a few of my favorite things.
summary: I combined some of my favorite things by creating some game extensions for TaleSpire, which I use to facilitate Dungeons & Dragons games.
authors:
- ben-sampica
tags:
- JavaScript
- DND
date: '2023-11-27T00:00:00Z'
lastmod: '2023-11-27T00:00:00Z'
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction
If you've talked to me for more than five minutes, I've probably mentioned that I am a fanatical Dungeons & Dragons game master because I really like _making shit_. Obviously, I'm a developer as my profession but it is also a hobby of mine outside of work because I really like _making shit_. So when I find the opportunity to combine both of these crafting hobbies together it consumes me; my brain gets hijacked by the double-dose of dopamine of _making shit_ and it becomes all I can think about for a bit. 

I use a game called _TaleSpire_ to craft worlds for my players to create their own experiences and tell stories they are in the driver seat of making. Unfortunately, I have been missing a few important things that just make management of the game tough. _TaleSpire_ allows [modifications](https://symbiote-docs.talespire.com/) (mods) to the game (called _symbiotes_) which are essentially just side-loaded HTML pages that allow for CSS & JavaScript. Baked into these _symbiotes_ are event handlers, so developers can listen to events that happen inside the game and react to them in custom ways with said HTML/CSS/JS.

## The Problem Of Managing Combat
Problem #1: Oftentimes in Dungeons & Dragons, the player characters (other people in real life) who are playing alongside the Game Master (me) will stumble upon, or create, a situation that involves conflict. As is common in role-playing games, a potential avenue to resolve that conflict is beating the other people up (might makes right so the phrase goes). Part of combat is the ability to do things you cannot do in real life like cast magic spells, perform acrobatic feats largely impossible, etc.. Player characters and non-player characters (all the other people being played by the Game Master) may cast spells that can help or hinder themselves or their opponents. 

For example, the spell _Bless_ helps the caster and his allies to avoid hits from incoming attacks (possibly a sword). As the overall game fairness would be hard to manage without these powerful spells expiring at some point, spells like _Bless_ stop working after an in-game minute. However, as the game progresses and both the player characters and their adversaries become stronger, these effects become numerous with the Game Master managing most of the flow of combat (who's turn it is to play, playing every non-player character, rule management, which spells have expired, etc.. Exhausting!) To make matters worse, combat can sometimes take hours (or for the truly epic, days) in real life. This can lead to, frankly, forgetting stuff. In the interest of fairness, forgetting things sucks and, in my opinion, devalues the experience the players themselves are trying to create.

So, I created a mod ([link to mod](https://mod.io/g/talespire/m/5e-combat-tracker) | [link to code](https://github.com/benjaminsampica/talespire-symbiotes/tree/main/combat-tracker)) that allows me to track the flow of combat with ease. It automatically tracks the initiative list with real-time adds/deletes and turn completion so I can easily track the round count and manage conditions / effects of all creatures on the initiative list.

{{< figure src="images/combat-tracker.PNG" title="The Combat Tracker TaleSpire Mod" lightbox="true" >}}

## The Problem Of Sharing Images
Problem #2: This one is a lot easier to explain. There is no easy way to share images with other players in TaleSpire itself. I want to share images of all kinds with my players - what items look like, the world map, etc.. 

TaleSpire allows you to sync state between every other player with the symbiote installed so this was as easy as creating a mod ([link to mod](https://mod.io/g/talespire/m/broadcast-image) | [link to code](https://github.com/benjaminsampica/talespire-symbiotes/tree/main/broadcast-image)) letting anyone broadcast an image all others.

{{< figure src="images/broadcast-image.PNG" title="The Broadcast Image TaleSpire Mod" lightbox="true" >}}

## Wrap Up
I wasn't really that familiar with JavaScript or Node, as I'm primarily a .NET developer. It was nice to hone these skills, learn javascript language features, and bring along some good practices (like automated testing) and see how they work in JavaScript land.

My favorite part of making things is being able to share it with others. Both of these mods are available for any Game Master to download and use inside of TaleSpire itself by simply clicking a button.
