using FitTrack.E2ETests.PageObjects;
using Microsoft.Playwright.Xunit.v3;
using Xunit;

namespace FitTrack.E2ETests.Tests;

public class AuthTests : PageTest
{
    [Fact]
    public async Task LogIn_ValidInput_RedirectsToDashboard()
    {
        var logInPage = new LogInPage(Page);

        var email = TestConfig.TestEmail;
        var password = TestConfig.TestPassword;

        await logInPage.LogInAsync(email, password);
        
        await Expect(Page).ToHaveURLAsync(TestConfig.BaseUrl + "/app");
    }

    [Fact]
    public async Task Register_ValidInput_RedirectsToDashboard()
    {
        var registerPage = new RegisterPage(Page);

        var name = "E2E User";
        var email = $"test{Guid.NewGuid()}@mail.com";
        var password = TestConfig.TestPassword;

        await registerPage.RegisterAsync(name, email, password);

        await Expect(Page).ToHaveURLAsync(TestConfig.BaseUrl + "/app");
    }
}