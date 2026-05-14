using Microsoft.Playwright;

namespace FitTrack.E2ETests.PageObjects;

public class RegisterPage
{
    private readonly IPage _page;

    public RegisterPage(IPage page) => _page = page;

    public async Task GoToAsync() =>
        await _page.GotoAsync(TestConfig.BaseUrl + "/register");

    public async Task RegisterAsync(string name, string email, string password)
    {
        await GoToAsync();

        await _page.GetByLabel("Name").FillAsync(name);
        await _page.GetByLabel("Email").FillAsync(email);
        await _page.GetByLabel("Password").FillAsync(password);

        await _page.GetByRole(AriaRole.Button, new PageGetByRoleOptions
        {
            Name = "Create account"
        }).ClickAsync();
    }
}