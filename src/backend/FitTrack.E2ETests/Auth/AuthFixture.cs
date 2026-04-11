using Microsoft.Playwright;
using Xunit;
using System.Text.Json;

namespace FitTrack.E2ETests.Auth;

public class AuthFixture : IAsyncLifetime
{
    public string StorageStatePath =>
            Path.Combine(AppContext.BaseDirectory, ".playwright", ".auth");

    public async ValueTask InitializeAsync()
    {
        var playwright = await Playwright.CreateAsync();

        // 1. Call API login
        var request = await playwright.APIRequest.NewContextAsync(new()
        {
            BaseURL = TestConfig.ApiUrl
        });

        var response = await request.PostAsync("/api/auth/login", new()
        {
            DataObject = new
            {
                email = TestConfig.TestEmail,
                password = TestConfig.TestPassword
            }
        });

        if (!response.Ok)
            throw new Exception("Login failed");

        var json = JsonDocument.Parse(await response.TextAsync());

        var accessToken = json.RootElement.GetProperty("accessToken").GetString();
        var refreshToken = json.RootElement.GetProperty("refreshToken").GetString();

        // 2. Open browser context
        var browser = await playwright.Chromium.LaunchAsync(new()
        {
            Headless = true
        });

        var context = await browser.NewContextAsync();
        var page = await context.NewPageAsync();

        await page.GotoAsync(TestConfig.BaseUrl);

        // 3. Inject tokens into localStorage
        await page.EvaluateAsync(@"(tokens) => {
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
        }", new
        {
            accessToken,
            refreshToken
        });

        // 4. Save auth state
        var dir = Path.Combine(AppContext.BaseDirectory, ".playwright");

        Directory.CreateDirectory(dir);

        await context.StorageStateAsync(new()
        {
            Path = StorageStatePath
        });

        await browser.CloseAsync();
    }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;
}