---
title: 'Azure AD Authentication Pitfall #1'
subtitle: 'What the documentation fails to tell you.'
summary: 'A common authentication pattern with Azure AD comes to a screeching halt because of backwards compatibility.'
authors:
- ben-sampica
tags:
- Azure
- IAC
- CSharp
date: '2022-11-13T00:00:00Z'
lastmod: '2022-11-13T00:00:00Z'
featured: false
draft: false
toc: true
---

{{< toc >}}

## The Story 

I've been doing a lot of cloud infrastructure recently in Azure for systems that are entirely internal but need to be able to talk to each other. Without just leaving them completely open internally, basic Azure Active Directory authentication is a great way for applications to have a pragmatic amount of security for app -> app scenarios (documentation calls them daemons). This type of authentication flow is primarily documented [here](https://learn.microsoft.com/en-us/azure/app-service/configure-authentication-provider-aad#daemon-client-application-service-to-service-calls).

So I've got an application that needs to authenticate with Azure AD so it can talk to another application. Easy, right? Mostly, yes. Except for this one really annoying thing...
If you're using .NET 5 or later, chances are you just downloaded the latest `Microsoft.Identity.Web` NuGet package to authenticate in your application and just created a new App Service in Azure with the defaults. But a few years ago, the Azure AD endpoints (v1) had a different authentication and token url. They've since updated them via v2  (it's now `login.microsoftonline.com`), but when you spin up your application registration so your application can identity itself, by default the registration uses the v1 endpoints. The latest NuGet package uses the v2 endpoints and the JWT token you receive back has an issuer of the old one and so you'll be unable to authenticate using it!

I could not for the life of me find a google result for this so hopefully this helped you. Many places hinted at what needed done but of course I only realized that once I knew what it was doing.

## The Fix

The fix is simple - go into the application registration's `manifest` and manually change the property called `accessTokenAcceptedAttribute` to `2`. By default, the [property is null](https://learn.microsoft.com/en-us/azure/active-directory/develop/reference-app-manifest#accesstokenacceptedversion-attribute) which means 1. 