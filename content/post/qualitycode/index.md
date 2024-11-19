---
title: What is Quality Code?
subtitle: A personal manifesto
summary: A short manifesto of what I believe quality code means.
authors:
- ben-sampica
tags:
- Software Craftsmanship
date: '2022-12-01T00:00:00Z'
lastmod: '2022-12-01T00:00:00Z'
featured: false
draft: false
toc: false
---

My (current) manifesto on what quality code is…

_Code that solves a problem with the lowest complexity and simultaneously providing the highest value to everyone involved, be they the ones writing it, reviewing it, or receiving it. I admit that quality code can be subjective person-to-person, team-to-team, but believe it generally has the following characteristics..._

*Above all else, it is simple*
- Favor solving or dissolving problems - with code as a tool to do so. The highest quality code is no code at all. [Half of features built are simply never used](https://www.linkedin.com/pulse/why-45-all-software-features-production-never-used-david-rice/). That being said, never forget to satisfy the customer.
- Favor code that is read and understood with as few questions as possible by peers. When questions arise, favor refactoring to a better shared understanding over writing documentation, which can have a disjointed lifetime to the code itself and [can cause its own harm](https://www.bensampica.com/post/cleancode3/).
- Favor code that has already been written, especially by trusted external authors. Language features, frameworks, and patterns that are baked into our existing toolsets are favored over custom solutions for their ability to cross organizational boundaries and be maintained with no additional effort on our part.
- Favor applying architectures and patterns only at the last responsible moment.

*It is built with change in mind*
- Favor code that has only one reason to change. This is does not necessarily mean very small classes or methods, instead I frame “reason to change” around a feature that a stakeholder would ask to change.
- Favor tests alongside production code. These can be written before or after the code but should be focused on desired behavior and not implementation.
- Favor higher-order tests when the ease of setup is similar to lower-order tests, avoiding mocks because we lose valuable information about the system as a whole when testing only in tiny pieces. Mocks cause friction to change by exposing implementation which hampers our ability to change out pieces.

*It is reviewed by others as fast as possible*
- Favor writing code alongside (truly, at the same time!) multiple people to minimize/eliminate pitfalls and maximize value. It is even better if you can involve someone who will use the code (or a proxy) in affirming the value immediately.
- Favor code that follows the team’s agreed upon styling and structure. This eliminates a lot of low-value conversation that can suck the air and energy out of broader, more important discussion. This styling and structure can and likely will change over time.

*It is honest about itself by detailing its own weaknesses*
- Favor code with comments when expectations are subverted. Language features with bugs, quirks in tooling, or imperfect design at integration points to other systems are good candidates for comments.
- Favor code with proper documentation when the code is to be consumed asynchronously by those who are not easily able to interact with the authors of the code. This barrier can be much higher than it appears to the authors and the effects of not providing any documentation are acutely painful. This documentation should live as close to where the consumers will read it as possible with the best outcome of shipping alongside the code itself.

*Bonus Section: What Quality Code Is Not*
- Immediately bug free (despite everyone doing the best to their ability). Bugs are behavior which has subverted expectations of the people who wrote the code for the behavior or those using it for the intended behavior. These expectations are sometimes hard to convey which is why we deliver fast and frequently.
- Gap free, which differs from bugs. These are conscious, pragmatic decisions made during development from believed constraints of the system as a whole. 
- Eternally bug free. As the system changes, or the wider systems that integrate with it, gaps may grow into bugs. This is a balancing act of experience, simplicity, and relative safety. I acknowledge I have no crystal ball and so do my best to maintain this knife-edge balance.
- Guaranteed to be its final function or form. We deliver fast so we can figure out exactly what that is but prepare for it to change - even late in development.
- The shortest or smallest amount of code.
- Dogmatic 'best practices' on how code should be formatted, written, applied, etc..
