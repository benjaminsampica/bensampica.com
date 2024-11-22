---
title: Working with Timers in TimeProvider
subtitle: Migrating existing System.Timers and creating new TimeProvider-based timers.
summary: 'How to work with Timers in TimeProvider and how to migrate existing timers to them.'
authors:
- ben-sampica
tags:
- DotNet
- CSharp
date: '2024-11-22T00:00:00Z'
lastmod: '2024-11-22T00:00:00Z'
featured: false
draft: false
toc: true
---

{{< toc >}}

## Introduction

I have seen a ton of articles on working with .NET 8's TimeProvider - specifically, how to use the _date and time_ piece of it in order to test out things like making sure dates and times are expected values. However, there's another part of `TimeProvider` that I just really struggled with Googling no matter how many pages I went through - the `ITimer` implementation inside of `TimeProvider`. The Microsoft documentation also is really light on using the `ITimer` as well so I had to just blunt force figure it out.

My pain is our gain 😊.

## System.Timer to ITimer

Part of the headache was I have used the `System.Timers` Timer a long time. A common way to use the API surface of it is like the following:

```csharp
using System.Timers;

var timer2 = new Timer();
timer2.Interval = 5000; // Or constructor injected.
timer2.Elapsed += (object? sender, ElapsedEventArgs e) =>
{
    Console.WriteLine("Five seconds has passed in the older timer.");
};
timer2.AutoReset = true;
timer2.Start(); // or timer.Enabled = true
```

I am not claiming this easy to use. It is just that I have been using it for various things for a long time (including making a [really garbage simon says game for a D&D session in 30 minutes](https://github.com/benjaminsampica/Simon)). Here is how this looks with `ITimer`

```csharp
using System;

var timeProvider = TimeProvider.System; // This is normally injected. We'll go there later.
var timer = timeProvider.CreateTimer((state) => {
    Console.WriteLine("Five seconds has passed in the new timer.");
}, null, TimeSpan.FromSeconds(5), TimeSpan.FromSeconds(5));
```

Both produce the same output every 5 seconds.

```c
// When 5 seconds has passed...
Five seconds has passed in the new timer.
Five seconds has passed in the older timer.
// When 10 seconds has passed...
Five seconds has passed in the new timer.
Five seconds has passed in the older timer.
// Etc.
```

I definitely prefer the new interface now that I understand it! It is a lot easier to use. Let's walk through the _new_ code and what it does.

```csharp
using System;

var timer = timeProvider
    .CreateTimer((state) => {
        Console.WriteLine("Five seconds has passed in the new timer.");
    }, 
    null,
    TimeSpan.FromSeconds(5), 
    TimeSpan.FromSeconds(5));
```

The first parameter `(state) => {}` takes in a callback which will be called when the timer is triggered. The `state` parameter is actually passed in the second parameter and can be anything. For example, if you are performing asynchronus work in a timer, you can pass the cancellation token like so.

```csharp
var cancellationToken = new CancellationToken();
var timeProvider = TimeProvider.System;
var timer = timeProvider.CreateTimer((state) =>
{
    if (state is not CancellationToken ct) return;
    if (ct.IsCancellationRequested) return;
    
    Console.WriteLine("Five seconds has passed in the new timer.");
}, cancellationToken, TimeSpan.FromSeconds(5), TimeSpan.FromSeconds(5));
```

The third parameter `TimeSpan.FromSeconds(5)` is the delay before the _first_ time the callback triggers. Finally, the fourth parameter `TimeSpan.FromSeconds(5)` is the delay before every _subsequent_ time the callback triggers.

## Stopping an ITimer
This is where it gets different from how my brain was wired from the old `System.Timers`. In order to effectively _stop_ an `ITimer`, you invoke the `Change()` argument.

```csharp
timer.Change(Timeout.Infinity, Timeout.Infinity)
```

This is just like specifying the third and fourth parameters of the `.CreateTimer()` method. The first parameter is how often to delay the _first_ time to trigger and the second parameter is how often to delay the _subsequent_ triggers.

## Resetting an ITimer
Just like stopping the timer you can invoke the `.Change()` method and effectively reset the timeout. This also give you an opportunity to change the initial delay and subsequent trigger delay.

```csharp
var timer = timeProvider.CreateTimer((state) =>
{
    Console.WriteLine("Five seconds has passed in the new timer.");
}, null, TimeSpan.FromSeconds(5), TimeSpan.FromSeconds(5));

// Stop the timer.
timer.Change(Timeout.Infinity, Timeout.Infinity)

// Reset the timer to the initial state.
timer.Change(TimeSpan.FromSeconds(5), TimeSpan.FromSeconds(5));
```

It is important to note that whenever the Change method is invoked, the current elapsed time of the current trigger is lost. For example, if a timer triggers every five seconds and at the fourth second a Change is invoked with a new 5 second delay, it will be 5 seconds before the timer callback triggers. The previous 4 seconds elapsing does not matter.

## Testing with an ITimer
Just like if you're working with dates & times, you should dependency inject the `TimeProvider` into a class in order to use it. To register the time provider to the dependency injection container a single concrete implementation is implemented already for us. This looks something like

```csharp
// Some Program.cs
builder.Services.AddSingleton(TimeProvider.System);
```

You can then inject it via constructor injection anywhere

```csharp
// Foo.cs
public class Foo(TimeProvider timeProvider)
{
    public int BarCreationCount { get; private set; }

    public Bar CreateBar() => new Bar(timeProvider.CreateTimer((state) => BarCreationCount++, null, TimeSpan.FromSeconds(5), TimeSpan.FromSeconds(5))));
}

// Bar.cs
public class Bar(ITimer timer)
{
    // use the timer.
}
```

Now, we can write tests using our time provider and advance time. To expedite writing tests, we can install a nuget package called `Microsoft.Extensions.TimeProvider.Testing` which gives us a `FakeTimeProvder` that implements the abstract `TimeProvider`. This test might look something like:

```csharp
// Test.cs

public void ShouldInvokeEveryFiveSeconds()
{
    var timeProvider = new FakeTimeProvider();
    var foo = new Foo(timeProvider);

    timeProvider.Advance(TimeSpan.FromSeconds(10));

    Assert.That(foo.BarCreationCount, 2); // Should invoke twice.
}
```

That wraps it up. Thanks for reading!
