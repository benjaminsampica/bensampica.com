---
title: Fluent Validation
subtitle: Validate with something a human can read.
summary: Learning, using, and extending the FluentValidation library.
authors:
- ben-sampica
tags:
- DotNetCore
- CSharp
date: '2020-05-20T00:00:00Z'
lastmod: '2020-05-20T00:00:00Z'
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

{{< toc >}}

## Introduction

[Fluent Validation](https://fluentvalidation.net/) is a .NET library for creating strong-typed, fluent validation rules. Built into the library are familiar validators like `EmailAddress` and `NotEmpty`, but also it's extremely nimble and allows creating custom validators or even reusing them. Out of the box, Fluent Validation works with ASP.NET Core's service container so that determining model rules can stay where it belongs - in an validator. Fluent Validation also comes with unit testing tools to easily validate that your model validation rules are functioning correctly.

See the sample repo here: [FluentValidationExampleProject](https://github.com/benjaminsampica/bensampica.com/tree/main/content/post/fluentvalidation)

## The Theoretical
Traditionally, MVC models have been validated in one of three ways.

### The First Way
For the simplest of them, data annotations would have your back.
```csharp
public class AddEditPaymentModel
{
    [Required]
    public decimal Amount { get; set; }

    // Other properties...
}
```

If this gets even slightly more complicated, such that you have properties that depend on other properties in order to be triggered (such as limiting an credit card payment to _only_ be up to the balance due), you have one of two options.

### The Second Way
Throw the logic into the controller action and reassert the model state validity

```csharp
public IActionResult AddPayment(AddEditPaymentModel viewModel)
{
    if(_paymentValidateService.DoesAmountExceedBalance(viewModel.Amount) ModelState.AddModelError("Amount", "Amount cannot be greater than balance due.");
    if(!ModelState.IsValid) return View(viewModel);

    // Otherwise do stuff...
}
```

### The Third Way
Inherit `IValidatableObject` on your model.

```csharp
public class AddEditPaymentModel : IValidatableObject
{
    [Required]
    public decimal Amount { get; set; }

    // Other properties...

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var service = (IPaymentValidateService)validationContext.GetService(typeof(IPaymentValidateService));

        var results = new List<ValidationResult>();
        if (service.DoesAmountExceedBalance(Amount))
        {
            results.Add(new ValidationResult("Amount cannot be greater than balance due."));
        }

        return results;
    }
}
```

### These Are Not The Way
We run into problems with all three of these approaches.
1. Automatically validating data annotations via unit testing is somewhat cumbersome.
2. For the controller method:
    - We have to inject services that the controller shouldn't be concerned about (a controller should dictate flow, in this case it's validating the payment).
    - It's also confusing to mix data annotations and additional model state concerns inside individual actions when it comes to keeping things in one spot.
    - If we need to validate the payment in other places, the controller model state validation will need duplicated in more places. This turns something that is a domain problem into a giant cross-cutting mess.
    - Unit testing the validation is cumbersome as it requires mocking the controller, all injected services (relevant or not), and the model itself.
3. For the interface method on the model:
    - Dependency injection is not automatically resolved, requiring us to use an service locator anti-pattern to force the service into the context.
    - Unit testing the validation is cumbersome having to mock `ValidationContext`, which is an implementation detail rather than what we actually are trying to test. Also, because of the anti-pattern introduced, it's unclear from outside the method (like the unit test) what its dependencies are.
    - No async support - need to wrap everything in `Task.Run(() =>)` or `GetAwaiter().GetResult()`

## The Practical

By default, when FluentValidation is integrated into an library it sits side-by-side with existing validation implementations such as data annotations for a true backwards-compatible approach. Like other frameworks, it offers an assembly scanning approach or single registration approach to add its members. Below is the assembly scanning approach, which is recommended.

```csharp
// Startup.cs

using FluentValidation.AspNetCore;

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // Extension method `AddFluentValidation()` which chains off of `IMvcBuilder`.
        services.AddControllersWithViews()
            .AddFluentValidation(fv => fv.RegisterValidatorsFromAssemblyContaining<Startup>());
    }
}

```

To use the example model class above, with FluentValidation it would now look like.

```csharp
public class AddEditPaymentModel
{
    public decimal Amount { get; set; }

    // Other properties...
}

public class AddEditPaymentModelValidator : AbstractValidator<AddEditPaymentModel>
{
    public AddEditPaymentModelValidator(IPaymentValidateService service)
    {
        RuleFor(p => p.Amount)
            .NotEmpty()
            .Custom((amount, validationContext) => {
                var isInvalid = service.DoesAmountExceedBalance(amount);
                if(isInvalid) validationContext.AddFailure("Amount cannot be greater than balance due.");
            });
    }
}
```

1. The model validation is now completely removed from the model itself - making enhancing and testing easier (which follows SRP).
2. The validator broadcasts its dependencies through the constructor (👋 bye anti-pattern).
3. Each rule has its own context and scope making complex business models easier to follow compared to `IValidatableObject`.
4. Supports asynchronous code with `MustAsync()` and `CustomAsync()`.

### How To Prove It

Testing model validation through a UI is tedious, boring, time-consuming, and is only valid immediately after you do it. Further changes require you to manually run through it again (or not 😉🤠). Unit testing these model validation rules is easy through a unit test and, more importantly, it tests everything with a click of a button. Simply create a new instance of your validator inside your test and include the `FluentValidation.TestHelper` namespace. This gives you a suite of testing extension methods to chain your validation.

```csharp
using FluentValidation.TestHelper;
using FluentValidation.Web.Models;
using FluentValidation.Web.Services;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace FluentValidation.Tests
{
    [TestClass]
    public class AddEditPaymentModelTests
    {
        private AddEditPaymentModelValidator _validator;

        [TestInitialize]
        public void Initialize()
        {
            var service = new PaymentValidateService();
            _validator = new AddEditPaymentModelValidator(service);
        }

        [TestMethod]
        public void Amount_GreaterThan_BalanceOfTen_IsInvalid() => _validator.ShouldHaveValidationErrorFor(p => p.Amount, 10.01m);

        [TestMethod]
        public void Amount_Equals_BalanceOfTen_IsValid() => _validator.ShouldNotHaveValidationErrorFor(p => p.Amount, 10);

        [TestMethod]
        public void Amount_LessThan_BalanceOfTen_IsValid() => _validator.ShouldNotHaveValidationErrorFor(p => p.Amount, 9);

        [TestMethod]
        public void Amount_BalanceError_HasCustomErrorMessage() => _validator.ShouldHaveValidationErrorFor(p => p.Amount, int.MaxValue).WithErrorMessage("Amount cannot be greater than balance due.");

        [TestMethod]
        public void Amount_Zero_IsInvalid() => _validator.ShouldHaveValidationErrorFor(p => p.Amount, 0);

        [TestMethod]
        public void Amount_Negative_IsInvalid() => _validator.ShouldHaveValidationErrorFor(p => p.Amount, -1);
    }
}
```
If a developer just saw these tests, there's a good chance they could recreate the actual business rules if the entire validator was deleted. More realistically, these unit tests provide a safety net when it comes time for heavy refactors. When you hear the phrase "the unit tests act as documentation of the business rules", this is what it's referring to. Additionally, it provides a safety net for making changes - with a click of a button you can make sure nothing you did broke any existing functionality. However, if your business rules change, your tests will change too.

### Sharing Is Caring
One of the more powerful aspects of FluentValidation is in it's ability to share validation rules, whether default compositions or custom.
#### Sharing Validators

You can create validators of a type (for example, `Address` and `PersonName`) and then compose those together onto a super class when needed.

```csharp
public class PersonModel
{
    public PersonNameModel PersonName { get; set; }
    public AddressModel Address { get; set; }
}

public class PersonNameModel
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
}

public class AddressModel
{
    public string Line1 { get; set; }
    public string Line2 { get; set; }
    public string Line3 { get; set; }
    public string City { get; set; }
    public int StateId { get; set; }
    public string Zip { get; set; }
}

public class PersonModelValidator : AbstractValidator<PersonModel>
{
    public PersonModelValidator()
    {
        RuleFor(p => p.PersonName).SetValidator(new PersonNameModelValidator());
        RuleFor(p => p.Address).SetValidator(new AddressModelValidator());
    }
}


public class AddressModelValidator : AbstractValidator<AddressModel>
{
    public AddressModelValidator()
    {
        RuleFor(m => m.Line1).NotEmpty();
        RuleFor(m => m.City).NotEmpty();
        RuleFor(m => m.StateId).NotEmpty();
        RuleFor(m => m.Zip).Length(5);
    }
}

public class PersonNameModelValidator : AbstractValidator<PersonNameModel>
{
    public PersonNameModelValidator()
    {
        RuleFor(p => p.FirstName).Length(3, 100);
        RuleFor(p => p.LastName).Length(3, 100);
    }
}
```

#### Custom Rules

You can write your own custom rule extensions to easily chain and share rules on properties across models. Some good examples are phone numbers, specific email addresses, and file extensions.

```csharp
public static class FluentValidationExtensions
{
    public static IRuleBuilderInitial<T, IFormFile> MatchesFileExtensions<T>(this IRuleBuilder<T, IFormFile> rule, params string[] allowedExtensions) where T : class
    {
        return rule.Custom((value, context) =>
        {
            if (value == null) return;

            if (allowedExtensions.All(ae => value.FileName.EndsWith(ae) == false))
            {
                context.AddFailure("File must be in the following formats: " + string.Join(", ", allowedExtensions));
            };
        });
    }
}
```

When applied, it looks exactly like the baked-in properties FluentValidation already provides.
```csharp
public class AddResumeModel
{
    public IFormFile Resume { get; set; }
}

public class AddResumeModelValidator : AbstractValidator<AddResumeModel>
{
    public AddResumeModelValidator()
    {
        RuleFor(p => p.Resume).MatchesFileExtensions(".pdf", ".docx");
    }
}
```

## Some Notes
Fluent Validation is... fluent - it's human-readable, making complex business logic and its backing validation rules simply easy to read and follow. Since it's .NET Standard, this FluentValidation can also be applied in .NET Framework projects.
