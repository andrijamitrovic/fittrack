using Microsoft.Playwright;
using Microsoft.Playwright.Xunit.v3;
using Xunit;

namespace FitTrack.E2ETests.Base;

[Collection("Auth")]
public class AuthenticatedPageTest : PageTest
{
    public override BrowserNewContextOptions ContextOptions()
        => new()
        {
            BaseURL = TestConfig.BaseUrl,
            StorageStatePath = ".playwright/.auth"
        };
}