using FitTrack.E2ETests;
using Microsoft.Playwright;

namespace FitTrack.E2ETests.PageObjects;

public class AddWorkoutPage
{
    private readonly IPage _page;

    public AddWorkoutPage(IPage page) => _page = page;

    public async Task GoToAsync() =>
        await _page.GotoAsync(TestConfig.BaseUrl + "/app/workouts/new");

    public async Task AddWorkoutAsync(
        string title,
        string notes,
        string selectOption,
        string reps,
        string weight,
        string rpe)
    {
        await GoToAsync();

        await _page.GetByLabel("Title").FillAsync(title);
        await _page.GetByLabel("Notes").FillAsync(notes);

        await _page.GetByRole(AriaRole.Button, new PageGetByRoleOptions
        {
            Name = "Add exercise"
        }).ClickAsync();

        await _page.GetByRole(AriaRole.Button, new PageGetByRoleOptions
        {
            Name = "Pick exercise"
        }).ClickAsync();

        await _page.GetByText(selectOption).ClickAsync();

        await _page.GetByRole(AriaRole.Button, new PageGetByRoleOptions
        {
            Name = "Add set"
        }).ClickAsync();

        await _page.GetByRole(AriaRole.Spinbutton).Nth(0).FillAsync(reps);
        await _page.GetByRole(AriaRole.Spinbutton).Nth(1).FillAsync(weight);
        await _page.GetByRole(AriaRole.Spinbutton).Nth(2).FillAsync(rpe);

        await _page.GetByRole(AriaRole.Button, new PageGetByRoleOptions
        {
            Name = "Save workout"
        }).ClickAsync();
    }
}