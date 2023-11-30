---
title: 'Azure DevOps Is Dead'
subtitle: 'Why GitHub is a more robust alternative.'
summary: 'A comprehensive compare and contrast between the two software solutions for shipping code with a breakdown of features that are present in GitHub and have been missing in AzDo for years.'
authors:
- ben-sampica
categories:
- DevOps
date: '2023-11-30T00:00:00Z'
lastmod: '2022-11-30T00:00:00Z'
featured: false
draft: true
toc: true
---

{{% toc %}}

## Introduction

You will have to excuse the hyperbolic title but I think there's no fewer words I can use to accurately sum up this in-depth comparison of Azure DevOps to GitHub. Also, let me start this off by saying I, in no way, am paid by Microsoft to shill GitHub. In fact, both of these products are Microsoft products. But one (hint: it's Azure DevOps) has been silently gasping for air for years. In the following article, I do not claim that GitHub reigns supreme among developer productivity & as a comprehensive toolchain. That being said, GitHub might not have _won_ the SaaS wars against some of the competing tools, but there is no doubt in my mind that Azure DevOps has taken a fatal blow and lays on the battlefield, bleeding out.

Am I biased towards GitHub? Is this article? You might say yes already and, at times, it might seem that way as you read on. But I promise all I am biased in favor of is boring technology, turn-key solutions for myself and my team, and constantly evolving tools to handle ever-increasing complex, demanding problems. [My mind is simple and the enemy of all developers is complexity](https://grugbrain.dev/); I want to do more with less because I like to **build stuff people love**.

I use Azure DevOps at my current place of work and as we look to the horizon to make decisions on the _scale of better_ course of action, I decided to take it upon myself to write this guide that will compare both tools. I'm going to bias towards things that are important to _me_ and my current organization. This means features that are public-focused (like GitHub Gists, which Azure DevOps doesn't have but are awesome) aren't going to be covered. The level of introspection and depth will vary but I will guarantee three things:

1. I will assume you're at least somewhat familiar with developer tooling and software delivery as to not have to waste words on preambles of setup.
2. I will include examples in the form of pictures, code snippets, links to code, etc..
3. I will try to compare and contrast all aspects of delivering software from concept to cash (but again, that are important to _me_).

Okay, that's enough putting up defensive walls and pre-explaining my position and what the hell this giant wall of text is. 

Let's start from the beginning.

## The Brief History

I'm not going to bore you with the details, but the short of it is this - GitHub was an independent product that was not owned by Microsoft long ago (in technology years). Skipping over the on-premise wars before SaaS products started really taking off, Microsoft developed Azure DevOps (once known as Team Foundation Server or _TFS_) as a competing cloud product, not just GitHub but also similar developer toolchain products like BitBucket, GitLab, etc.. Continuous, automated building and deployment was exploding in popularity and the market demanded tools to accommodate the growing complexity and interconnectivity of systems. 

As Microsoft was (IMO) pretty late to the game with their cloud offering, a lot of developers were already using GitHub to share their software. Share the software? Yes, the open source software movement was exponentially growing with tools like GitHub making it easier than ever to share & collaborate on common problems with code.

The timeline looks something like this:

- 2007 - Microsoft releases Team Foundation Services (TFS), an on-premise versioning system.
- 2008 - GitHub launches their service with a focus on open-source w/ a free model.
- 2012 - Microsoft becomes a significant user of GitHub for their repositories (.NET, MSBuild, Powershell, Visual Studio Code, etc.). Other companies like Facebook and Google have overwhelming use as well.
- 2013 - Microsoft launches Visual Studio Online, a quasi-rebrand of TFS and a nascent Azure DevOps with a subscription model closely tied to Visual Studio. This gets re-branded _again_ to Visual Studio Team Services (VSTS) along the way.
- June 2018 - Microsoft acquires GitHub.
- September 2018 - The service is finally called Azure DevOps and receives a free-tier that anyone can use.

## Comparison Breakdown

The below sections can be read out-of-band but will often refer to other sections - it's called a tool _chain_, after all. They are in no particular order except what came to mind first.

### The CODEOWNERS File

This feature missing from Azure DevOps that is present in GitHub is the [CODEOWNERS](https://docs.github.com/en/github-ae@latest/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) file. Placing this file inside a repository automatically establishes ownership over the configured files and folders, with a lot of levers to pull for fine-grained control.  What does this mean?

1. Pull Requests that include changes to that code can automatically include the owners on the pull request as _required approvers_. 
2. Ownership can be viewed in the UI directly (without even really knowing about the CODEOWNERS file existing).
3. The CODEOWNERS file can only be modified by, you guessed it, the owner of the repository itself.

{{< figure src="https://docs.github.com/assets/cb-28017/mw-1440/images/enterprise/repository/code-owner-for-a-file.webp" title="Ownership is visible when viewing files." lightbox="true" >}}

This is perfect for repositories with cross-team responsibilities and happens to align perfectly with companies trying to adopt [inner source cultures](https://about.gitlab.com/topics/version-control/what-is-innersource/). 

Here's an example of a CODEOWNERS file:

```
# This is a comment.
# Each line is a file pattern followed by one or more owners.

# These owners will be the default owners for everything in
# the repo. Unless a later match takes precedence,
# @global-owner1 and @global-owner2 will be requested for
# review when someone opens a pull request.
*       @global-owner1 @global-owner2

# Order is important; the last matching pattern takes the most
# precedence. When someone opens a pull request that only
# modifies JS files, only @js-owner and not the global
# owner(s) will be requested for a review.
*.js    @js-owner #This is an inline comment.

# You can also use email addresses if you prefer. They'll be
# used to look up users just like we do for commit author
# emails.
*.go docs@example.com

# Teams can be specified as code owners as well. Teams should
# be identified in the format @org/team-name. Teams must have
# explicit write access to the repository. In this example,
# the octocats team in the octo-org organization owns all .txt files.
*.txt @octo-org/octocats

# In this example, @doctocat owns any files in the build/logs
# directory at the root of the repository and any of its
# subdirectories.
/build/logs/ @doctocat

# The `docs/*` pattern will match files like
# `docs/getting-started.md` but not further nested files like
# `docs/build-app/troubleshooting.md`.
docs/*  docs@example.com

# In this example, @octocat owns any file in an apps directory
# anywhere in your repository.
apps/ @octocat

# In this example, @doctocat owns any file in the `/docs`
# directory in the root of your repository and any of its
# subdirectories.
/docs/ @doctocat

# In this example, any change inside the `/scripts` directory
# will require approval from @doctocat or @octocat.
/scripts/ @doctocat @octocat

# In this example, @octocat owns any file in a `/logs` directory such as
# `/build/logs`, `/scripts/logs`, and `/deeply/nested/logs`. Any changes
# in a `/logs` directory will require approval from @octocat.
**/logs @octocat

# In this example, @octocat owns any file in the `/apps`
# directory in the root of your repository except for the `/apps/github`
# subdirectory, as its owners are left empty.
/apps/ @octocat
/apps/github

# In this example, @octocat owns any file in the `/apps`
# directory in the root of your repository except for the `/apps/github`
# subdirectory, as this subdirectory has its own owner @doctocat
/apps/ @octocat
/apps/github @doctocat

```

### Bots
Any capabilities Azure DevOps has with bots, especially with security, is non-existent and must be manually imagined, invested in, and developed by you. Funnily enough, [Azure DevOps tokens checked into public GitHub repositories](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows#q-what-happens-if-i-accidentally-check-my-pat-into-a-public-repository-on-github) are picked up by GitHub.

GitHub's **Dependabot** is an automated dependency management tool integrated into GitHub. It regularly scans your project's dependencies for outdated packages and automatically creates pull requests to update them. This helps ensure that your project uses the latest and most secure versions of its dependencies. [Here is an example](https://github.com/benjaminsampica/benjaminsampica/pull/241) of one of my own personal repositories of this in action.

{{< figure src="images/dependabot-1.png" title="Dependabot automatically opening a pull request for a security alert." lightbox="true" >}}

If you pay for GitHub Enterprise, they have a security feature called [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) wich provides the following capabilities:

1. [Code scanning](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning) - similar to Dependabot but also can find errors in code.

{{< figure src="https://github.blog/wp-content/uploads/2020/09/token-scanning-2.png" title="A code scanning example." lightbox="true" >}} 

2. [Secret scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning) - searches all repository branches, PR comments, and descriptions for private keys, tokens, etc.

{{< figure src="https://github.blog/wp-content/uploads/2020/05/81083539-8e863a00-8ea9-11ea-8ae9-d4c83ed74998.png" title="A secret scanning example." lightbox="true" >}} 

3. [Dependency review](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review) - shows a comprehensive list of dependencies in every pull request as well as your dependencies security alerts.

{{< figure src="https://github.blog/wp-content/uploads/2020/12/102552843-b4e29980-4076-11eb-94a3-1738fa3c552e.png" title="A dependency review example." lightbox="true" >}} 

### Creating Documentation

Azure DevOps supports readme files in their repositories as well as markdown. They even claim to support [mermaid graphs](https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance?view=azure-devops#add-mermaid-diagrams-to-a-wiki-page), which are "officially" supported but broken where it matters... actually viewing them.

{{< figure src="images/mermaid.png" title="A mermaid diagram that should work but is broken. Sad." lightbox="true" >}}

However, readme's cannot be comprehensive (it is a single file, after all) and additional long-form written repository documentation has to sit further away, in AzDo's `Wikis` section which, annoyingly, implements the same security permission structures that the project uses (see also [secret and variable management](#secret--variable-management)). If your project has a global repository setup to protect your _main_/_master_ branch (very common), you have to submit a _pull request_ just to update documentation.

In GitHub, each repository has its own Wiki so this documentation can sit as close to the code as makes sense but doesn't inherit the same _git_ protections as the repository itself but only those with write permissions to the repository can contribute. As a bonus, the diagrams actually work, too.

### The Pipeline / Workflow Task Marketplace

### The Pipeline / Workflow Built-in Tasks 
Mention the amount of V0's on AzDo.

### Creating & Managing Build Validation

### Creating & Managing Pipelines / Workflows   

For example, Azure DevOps has the concept of _secure files_ in order to be able to download and read files (like certificates) during pipeline runs. There is a feature under secure files called _Properties_ which is [completely undocumented](https://stackoverflow.com/questions/53537035/access-azure-devops-secure-file-properties). Another example of how [the services investment in itself is low].

### Secret / Variable Management
Like the [Documentation](#documentation) section, pipeline secrets and variables in Azure DevOps are managed outside the repository in the `Library` section, with their own permission structure. Secrets are "_optionally_" secret and must be manually locked in order to actually hide them and must be replaced. If they aren't locked, they're a variable and viewable.

However, in GitHub, secrets and variables are two separate things and referenced in two separate ways in workflows. Secrets, once set, are always secret and only can be replaced. Advanced GitHub features pair really well here to make sure secrets always stay secret and that people aren't accidentally setting secrets as variables (see [the Bots section](#bots)).

### Deployments
Environment differences

### Release Management


### Artifact Registry
Azure DevOps and GitHub both provide common package hosting for shared libraries like _NuGet_ and _npm_ packages. However, GitHub also provides container hosting as part of their offering which is called [GitHub Packages](https://docs.github.com/en/packages/learn-github-packages/introduction-to-github-packages).

### The Service's API
Have you tried to use Azure DevOps's API to do things? At best, you'll find documentation that is only _slightly_ out of date with [their actual API](https://learn.microsoft.com/en-us/rest/api/azure/devops/?view=azure-devops-rest-7.2). At worst, you'll find some random thread off of Google where an answer recommends using a "hidden" API with only a HTTP verb and a URL as your north star. I'm particularly salty about this one as I tried to programmatically migrate repositories from one Azure DevOps project to another over a year ago and found it hilariously frustrating to pull off (if I didn't laugh about it, I'd cry). GitHub's API is no darling, but the documentation has been solid every time I have used it.

Security wise, GitHub allows much more fine-grained control over personal access tokens. Additionally, check out [the Bots section](#bots) to see the automatic protections in place for secret leakage.

### The Service's Investment In Itself
Mention the changes AzDo is pushing out vs. Github. 
### Adoption
I'm not going to pull out the different adoption numbers GitHub has as it's absurd so I'll stick with a personal ancedote. I just finished attending [.NET Conference 2023](https://www.dotnetconf.net/agenda), run by Microsoft itself, a few weeks ago. These folks are the prime candidates for using Azure DevOps - Microsoft employees, .NET Developers, overwhelmingly use Visual Studio, and Azure. All throughout the conference, every speaker that gave a presentation besides a _single one_ was using GitHub to share, host, and deploy their code.

As an aside, of those that were visible, there were more MacBooks than Surface's too 🤔.

### Templating Repositories
GitHub allows you to create template repositories that can be used as a starting point for new projects. These templates can include files, directories, and even default issues or pull requests. This helps maintain consistency across projects and saves time on initial project setup.

### Work Boards (Product Mgmt.)
Talk about automation in this space (w/ workkflows), projections based on cards, etc.

## Summary
This was a lot of information but the difference of approaches can really be summed up as this: Azure DevOps views its "Projects" as the center of the universe, with the management of `Wikis`, the variables/secrets in its `Library`, as well as builder & releaser of `Pipelines` and `Repos` as all each being different people and little overlap. GitHub views the repository itself as the center of the universe and is structured as such - most of the information that is a dozen or so clicks away is readily available on a _single page_ at the root GitHub repository, with most other information one click away.

{{< figure src="images/summary.png" title="GitHub's repository root page." lightbox="true" >}} 
