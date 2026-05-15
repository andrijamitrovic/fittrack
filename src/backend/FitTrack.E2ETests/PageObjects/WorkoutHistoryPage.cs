using Microsoft.Playwright;

namespace FitTrack.E2ETests.PageObjects;

public class WorkoutHistoryPage
{
    private readonly IPage _page;

    public WorkoutHistoryPage(IPage page) => _page = page;

    public async Task GoToAsync() =>
        await _page.GotoAsync(TestConfig.BaseUrl + "/app/workouts");

    public ILocator WorkoutTitle(string title) =>
        _page.GetByText(title);

    public ILocator WorkoutNotes(string notes) =>
        _page.GetByText(notes);

    public ILocator ExerciseName(string exerciseName) =>
        _page.GetByText(exerciseName);

    public ILocator WorkoutCard(string title) =>
        _page.GetByText(title).Locator("xpath=ancestor::div[contains(@class, 'rounded')]");

    public async Task EditWorkoutAsync(string title)
    {
        await WorkoutCard(title).GetByRole(AriaRole.Button, new LocatorGetByRoleOptions
        {
            Name = "Edit"
        }).ClickAsync();
    }

    public async Task CopyWorkoutAsync(string title)
    {
        await WorkoutCard(title).GetByRole(AriaRole.Button, new LocatorGetByRoleOptions
        {
            Name = "Copy"
        }).ClickAsync();
    }

    public async Task MakeTemplateAsync(string title)
    {
        await WorkoutCard(title).GetByRole(AriaRole.Button, new LocatorGetByRoleOptions
        {
            Name = "Template"
        }).ClickAsync();
    }

    public async Task DeleteWorkoutAsync(string title)
    {
        await WorkoutCard(title).GetByRole(AriaRole.Button, new LocatorGetByRoleOptions
        {
            Name = "Delete"
        }).ClickAsync();
    }
}