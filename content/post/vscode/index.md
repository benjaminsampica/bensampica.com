---
title: 'ASP.NET Core MVC && VSCode'
subtitle: 'Casting off the yoke of Visual Studio'
summary: 'Replacing Visual Studio with Visual Studio Code for ASP.NET Core MVC development'
authors:
- ben-sampica
categories:
- Tooling
date: "2020-03-31T00:00:00Z"
featured: false
draft: false
toc: true

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
# Placement options: 1 = Full column width, 2 = Out-set, 3 = Screen-width
# Focal point options: Smart, Center, TopLeft, Top, TopRight, Left, Right, BottomLeft, Bottom, BottomRight
image:
  placement: 2
  caption: 'Image credit: [**Unsplash**](https://unsplash.com/photos/CpkOjOcXdUY)'
  focal_point: ""
  preview_only: false

# Projects (optional).
#   Associate this post with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects = ["internal-project"]` references `content/project/deep-learning/index.md`.
#   Otherwise, set `projects = []`.
projects: []
---

{{% toc %}}

## Introduction
A post a couple weeks ago on Reddit in the r/dotnet subreddit caught my eye and the user asked about developing .NET Core applications inside of Visual Studio Code. Having piqued my interest about a year ago, I tried (and failed) the task of doing so then - my understanding of the dotnet CLI was too narrow, VS Code was brand new to me at the time, and the barrier to entry was too high with a huge swath of extensions. I just wanted to _write code_ damnit, not mess with a bunch of meta-programming features that Visual Studio already provided!

So here I am a year later, trying the same thing, and am happy to report some hard-bought success this time.

## The Theoretical

I found the Google-fu landscape pretty barren for traditional ASP.NET Core **MVC** programming and setup. With a large (understandable) swath of StackOverflow posts mostly talking about some combination of ASP.NET Core and a JS framework like Angular, or just WebAPI, I felt like I was treading the less travelled path as I attempted to rig up VSCode to be on par with my comfortable bed of Visual Studio features.

There was a laundry list of things I _absolutely_ needed out of VS Code (and its extensions) in order to consider it at feature-parity with Visual Studio

In no particular order, VS Code _**must**_:
- Build, watch, and debug C# files.
- Auto-recompile razor/html files.
- Support grunt tasks for auto-recompiling SASS/JS on change.
- Not interfere with existing team members using Visual Studio or Rider.
- Be able to run unit tests through a GUI.
- Have a way to view local/remote databases (SQL Server Object Explorer replacement).
- Support multi-project applications with easy context switching between them.
- MVC (JS, C#, Razor, etc.) Intellisense w/ code refactoring.
- Support Git actions through a GUI.
- NuGet lookup.
- Some level of code cleanup/formatting.
- Easily export my settings for use on other computers.

I'm happy to report I got all of these things, some with tears and confusion, but some as easy as clicking "Install Extension". I also got quite a few really awesome add-ons that I didn't even know I wanted.

All in all it took me about 12 hours of configuring VS Code, some trial-and-error with existing projects, and switching between Visual Studio and Code to really examine how I was actually writing code.

## The Practical

I'm going to just barf out a list of extensions and how they enhance my work. A :white_check_mark: signifies it matches my core needs.

- [.NET Core Add Reference](https://marketplace.visualstudio.com/items?itemName=adrianwilczynski.add-reference) :white_check_mark:
  - Quickly add references to other projects.
- [.NET Core Snippet Pack](https://marketplace.visualstudio.com/items?itemName=adrianwilczynski.asp-net-core-snippet-pack)
  - A handy set of shortcodes to create actions, controllers, and other ASP related things. This find was outside of my needs but I wasn't using anything like this in Visual Studio. A fine addition to my colllection!
- [.NET Core Test Explorer](https://marketplace.visualstudio.com/items?itemName=formulahendry.dotnet-test-explorer) :white_check_mark:
  - GUI-based test explorer. I prefer this extension over Visual Studio for the nice little `Run Test | Debug Test` it puts overtop each test method. I also prefer the UI it provides combined with VS Code.
- [.NET Core Tools](https://marketplace.visualstudio.com/items?itemName=formulahendry.dotnet)
  - Right-click to Build/Run/Test a `.sln` or `.csproj` file.
- [ASP.NET Core Switcher](https://marketplace.visualstudio.com/items?itemName=adrianwilczynski.asp-net-core-switcher)
  - Use a keybind to switch between a View and a Controller. Handy!
- [ASP.NET Helper](https://marketplace.visualstudio.com/items?itemName=schneiderpat.aspnet-helper) :white_check_mark:
  - Razor Intellisense
- [Auto Close Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-complete-tag) :white_check_mark:
  - Auto-rename and auto-close `html` tags.
- [Auto-Using for C#](https://marketplace.visualstudio.com/items?itemName=Fudge.auto-using)
  - Automatically pulls in references to known .NET libraries. I like this a lot but wish it could detect my own project libraries too.
- [Azure Account](https://marketplace.visualstudio.com/items?itemName=ms-vscode.azure-account)
  - Another stretch goal. Authenticates with Azure services. Used with the below Pipelines and Repos (since I use Azure DevOps inside and outside of work).
- [Azure Pipelines](https://marketplace.visualstudio.com/items?itemName=ms-azure-devops.azure-pipelines)
  - For use with CI/CD pipelines on Azure DevOps.
- [Azure Repos](https://marketplace.visualstudio.com/items?itemName=ms-vsts.team)
  - For use with tracking commits & work items on Azure DevOps.
- [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments)
  - Another "I didn't know I wanted it until I saw it then I absolutely had to have it". Adds really nice formatting to comments of different syntax.
- [Bracket Pair Colorizer](https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer)
  - Software engineering? Pretty smart. General Relativity? Pretty freakin' smart. The dude/dudette who thought this up? FREAKING _G E N I U S_. Download this. _NOW_. It colors each nested set of brackets, parentheses, or square brackets a different color. Where have you been all my life?
- [C#](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp) :white_check_mark:
  - Syntax highlighting, intellisense, general editing support for C#. Besides my mind being blown about Bracket Pair Colorizer, this is the most important extension in here.
- [C# Extensions](https://marketplace.visualstudio.com/items?itemName=kreativ-software.csharpextensions)
  - Allows quickly adding C# classes, interfaces, or initializing constructors. There's a few `C# Extensions` packages floating around and the only one actively developed is the one I linked above. Not part of my _needs_ but a very nice to have.
- [C# FixFormat](https://marketplace.visualstudio.com/items?itemName=Leopotam.csharpfixformat) :white_check_mark:
  - Adds some nice auto-formatting stuff like sorting usings, adding/subtracting indents, and cleaning up empty lines. Suplexes your code into submission.
- [C# XML Documentation Comments](https://marketplace.visualstudio.com/items?itemName=Leopotam.csharpfixformat)
  - A triple slash decorating properties, fields, methods, etc. spits out a auto-constructed XML comment.
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
  - Speel checks your comments, text, etc. for you.
- [Debugger For Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)
  - Lets you debug javascript files IN the javascript files. This was a huge find for me. Before this extension I was a member of the `F12` and `console.log()` javascript files clan inside the browser. I have seen the errors of my ways and ascended.
- [Dotnet core commands](https://marketplace.visualstudio.com/items?itemName=matijarmk.dotnet-core-commands)
  - Gives a nice Command Palette task for dotnet commands. I pretty much only use this for Entity Framework migrations and even then it's maybe once a day. Still a nice small time-saver.
- [Dracula Official](https://marketplace.visualstudio.com/items?itemName=dracula-theme.theme-dracula)
  - A theme for VS Code that reminds me of Miami Vice. I'm a sucker for 80s vice. I did have to tweak some of the colors through VSCode's `settings.json` to my liking, which are below. `edit.tokenColorCustomizations` is at the root level.
   ```
   "editor.tokenColorCustomizations": {
        "[Dracula]": {
            "keywords": "#c64bff",
            "textMateRules": [
                {
                    "scope":"storage",
                    "settings": {
                        "fontStyle": "italic"
                    }
                },
                {
                    "scope":"keyword",
                    "settings": {
                        "fontStyle": "italic"
                    }
                }
            ]
        }
    }
    ```
- [Essential ASP.NET Core 3 Snippets](https://marketplace.visualstudio.com/items?itemName=doggy8088.netcore-snippets)
  - More snippets to quickly procure actions, controllers, or views. There was some overlap with this and the above `.NET Core Snippet Pack` but there was also a few snippets each didn't have. Again this is something I didn't have at all in VS so it's great to have.
- [Font Awesome Auto-complete](https://marketplace.visualstudio.com/items?itemName=Janne252.fontawesome-autocomplete)
  - I use Font Awesome _a lot_ at work. This provides a preview of the icon in-line as you're typing! Saves a little time looking for that perfect icon to match your UI context.
- [gitignore](https://marketplace.visualstudio.com/items?itemName=codezombiech.gitignore)
  - Helps when working with .gitignore files in the Code editor.
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) :white_check_mark:
  - A supercharged git extension capable of showing you an incredible amount of git information at your fingertips. Even shows commit history in-line! VS Code already has a built-in git handler that met my original need, but I'm going to put this as a _must_ download.
- [Javascript Debugger (Nightly)](https://marketplace.visualstudio.com/items?itemName=ms-vscode.js-debug-nightly)
  - Combined with `Debugger For Chrome` this does some of the heavy lifting for debugging javascript. As the name says - duh.
- [Live Share](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare)
  - Allows for people to connect to your actual editor (or vice versa) and collaborate live on code. I admittedly haven't used this extension but once so far, but I loved the feature in Visual Studio and it's great for giving/receiving help to the next level.
- [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)
  - Provides good markdown support for VS Code. It's helping me write this.
- [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme)
  - An icon pack for the Code file explorer. Visual Studio had such boring icons. I wasn't a fan of VS Code's either.
- [MSBuild project tools](https://marketplace.visualstudio.com/items?itemName=tintoy.msbuild-project-tools)
  - NuGet intellisense inside of `.csproj` files. Also has some language service features I haven't used yet.
- [MsTest Snippets](https://marketplace.visualstudio.com/items?itemName=davidpetersmke.mstestsnippets)
  - Shortcodes for using with `MSTest` unit test projects.
- [Nuget Package Manager](https://marketplace.visualstudio.com/items?itemName=jmrog.vscode-nuget-package-manager) :white_check_mark:
  - You can use Command Palette to find/search and then add NuGet packages.
- [NuGet Reverse Package Search](https://marketplace.visualstudio.com/items?itemName=jesschadwick.nuget-reverse-package-search)
  - Reverse lookup on classes to NuGet packages. I've found this incredibly helpful for Microsoft namespaces especially as they have lots of packages underneath `Microsoft.Extensions.DependencyInjection`.
- [Paste JSON as Code](https://marketplace.visualstudio.com/items?itemName=quicktype.quicktype)
  - Allows you to quickly convert JSON to another language type (I suggest C# :smirk:)
- [Settings Sync](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync) :white_check_mark:
  - Allows you to sync settings to the cloud for multiple environments. This was a big reason my first attempt at this failed. _Note:_ Microsoft is working on bringing this feature in-house so this will likely be unneeded in the coming weeks.
- [SQL Server (mssql)](https://marketplace.visualstudio.com/items?itemName=ms-mssql.mssql) :white_check_mark:
  - Browse databases inside Code.
- [Task Explorer](https://marketplace.visualstudio.com/items?itemName=spmeesseman.vscode-taskexplorer) :white_check_mark:
  - Browse tasks inside Code. I use this for my grunt files and it works pretty much the same as VS's Task Runner Explorer.
- [TODO Highlight](https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight)
  - Brings `TODO` really in your face!
- [Version Lens](https://marketplace.visualstudio.com/items?itemName=pflannery.vscode-versionlens)
  - Gives version information right above packages in the project `.csproj`. Makes it really easy to see, manage, and bump project dependencies.

## Some Notes

Installing the :white_check_mark: extensions and reading their setups should get you ready to develop in VS Code in no time. I'd recommend all of the others, however. Besides the flow difference between VS and Code, my only other big hurdle was the `launch.json` and `tasks.json` files for debugging with Chrome and running my tasks. They are the following:


```
// launch.json
{
   // Use IntelliSense to find out which attributes exist for C# debugging
   // Use hover for the description of the existing attributes
   // For further information visit https://github.com/OmniSharp/omnisharp-vscode/blob/master/debugger-launchjson.md
   "version": "0.2.0",
   "configurations": [
        {
            "name": ".NET Core Launch (web)",
            "type": "coreclr",
            "request": "launch",
            "preLaunchTask": "build",
            // If you have changed target frameworks, make sure to update the program path.
            "program": "${workspaceFolder}/bin/Debug/netcoreapp3.1/WebApplication1.Web.dll",
            "args": [],
            "cwd": "${workspaceFolder}",
            "stopAtEntry": false,
            // Enable launching a web browser when ASP.NET Core starts. For more information: https://aka.ms/VSCode-CS-LaunchJson-WebBrowser
            "serverReadyAction": {
                "action": "debugWithChrome",
                "pattern": "^\\s*Now listening on:\\s+(https?://\\S+)"
            },
            "env": {
                "ASPNETCORE_ENVIRONMENT": "Development",
                "ASPNETCORE_URLS": "https://localhost:44325"
            },
            "sourceFileMap": {
                "/Views": "${workspaceFolder}/Views"
            }
        }
    ]
}
```
<hr>

```
// tasks.json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build",
            "command": "dotnet",
            "type": "process",
            "args": [
                "build",
                "${workspaceFolder}/WebApplication1.Web.csproj",
                "/property:GenerateFullPaths=true",
                "/consoleloggerparameters:NoSummary"
            ],
            "problemMatcher": "$msCompile"
        },
        {
            "label": "publish",
            "command": "dotnet",
            "type": "process",
            "args": [
                "publish",
                "${workspaceFolder}/WebApplication1.Web.csproj",
                "/property:GenerateFullPaths=true",
                "/consoleloggerparameters:NoSummary"
            ],
            "problemMatcher": "$msCompile"
        },
        {
            "label": "watch",
            "command": "dotnet",
            "type": "process",
            "args": [
                "watch",
                "run",
                "${workspaceFolder}/WebApplication1.Web.csproj",
                "/property:GenerateFullPaths=true",
                "/consoleloggerparameters:NoSummary"
            ],
            "problemMatcher": "$msCompile"
        },
        {
            "label": "Watch",
            "type": "shell",
            "command": "grunt watch",
            "runOptions": {
                "runOn": "folderOpen"
            },
            "isBackground": true
        }
    ]
}
```