using Microsoft.Playwright;

namespace FitTrack.E2ETests.PageObjects;

public class LogInPage
{
    private readonly IPage _page;

    public LogInPage(IPage page) => _page = page;

    public async Task GoToAsync() =>
        await _page.GotoAsync(TestConfig.BaseUrl + "/login");

    public async Task LogInAsync(string email, string password)
    {
        await GoToAsync();

        await _page.GetByLabel("Email").FillAsync(email);
        await _page.GetByLabel("Password").FillAsync(password);

        await _page.GetByRole(AriaRole.Button, new PageGetByRoleOptions
        {
            Name = "Log In"
        }).ClickAsync();
    }
}