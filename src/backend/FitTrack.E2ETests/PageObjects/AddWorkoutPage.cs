using FitTrack.E2ETests;
using Microsoft.Playwright;

public class AddWorkoutPage
{
    private readonly IPage _page;

    public AddWorkoutPage(IPage page) => _page = page;

    public async Task GoToAsync() =>
        await _page.GotoAsync(TestConfig.BaseUrl + "/newworkout");

    public async Task AddWorkoutAsync(string title, string notes, string selectOption, string reps, string weight, string rpe)
    {
        await GoToAsync();
        await _page.GetByLabel("Title:").FillAsync(title);
        await _page.GetByLabel("Notes:").FillAsync(notes);

        await _page.GetByRole(AriaRole.Button, new PageGetByRoleOptions { Name = "+ Add exercise" }).ClickAsync(); 
        await _page.GetByLabel("Exercise:").SelectOptionAsync(new SelectOptionValue { Label = selectOption });
        await _page.GetByRole(AriaRole.Button, new PageGetByRoleOptions { Name = "Add Set" }).ClickAsync();

        await _page.GetByLabel("Reps:").FillAsync(reps);
        await _page.GetByLabel("Weight:").FillAsync(weight);
        await _page.GetByLabel("RPE:").FillAsync(rpe);

        await _page.GetByRole(AriaRole.Button, new PageGetByRoleOptions { Name = "Save Workout"}).ClickAsync();
    }
}