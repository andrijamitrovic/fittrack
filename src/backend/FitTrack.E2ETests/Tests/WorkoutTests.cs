using System.Text.RegularExpressions;
using FitTrack.E2ETests.Base;
using FitTrack.E2ETests.PageObjects;
using Microsoft.Playwright;
using Xunit;

namespace FitTrack.E2ETests.Tests;

public class WorkoutTests : AuthenticatedPageTest
{
    [Fact]
    public async Task AddWorkout_ValidInput_SavesWorkout()
    {
        var addWorkoutPage = new AddWorkoutPage(Page);
        var historyPage = new WorkoutHistoryPage(Page);

        string title = $"E2E Workout {Guid.NewGuid()}";
        string notes = "testNotes";
        string exercise = "Barbell Bench Press";

        await addWorkoutPage.AddWorkoutAsync(title, notes, exercise, "1", "1", "1");

        await Expect(Page).ToHaveURLAsync(TestConfig.BaseUrl + "/app/workouts");
        await Expect(historyPage.WorkoutTitle(title)).ToBeVisibleAsync();
    }

    [Fact]
    public async Task EditWorkout_ValidInput_UpdatesWorkout()
    {
        var addWorkoutPage = new AddWorkoutPage(Page);
        var historyPage = new WorkoutHistoryPage(Page);

        string title = $"E2E Workout {Guid.NewGuid()}";
        string updatedTitle = $"E2E Updated Workout {Guid.NewGuid()}";
        string notes = "testNotes";
        string exercise = "Barbell Bench Press";

        await addWorkoutPage.AddWorkoutAsync(title, notes, exercise, "1", "1", "1");

        await historyPage.EditWorkoutAsync(title);

        await Expect(Page).ToHaveURLAsync(new Regex(".*/app/workouts/edit/.*"));

        await Page.GetByLabel("Title").FillAsync(updatedTitle);

        await Page.GetByRole(AriaRole.Button, new PageGetByRoleOptions
        {
            Name = "Save changes"
        }).ClickAsync();

        await Expect(Page).ToHaveURLAsync(TestConfig.BaseUrl + "/app/workouts");
        await Expect(historyPage.WorkoutTitle(updatedTitle)).ToBeVisibleAsync();
        await Expect(historyPage.WorkoutTitle(title)).Not.ToBeVisibleAsync();
    }

    [Fact]
    public async Task CopyWorkout_ExistingWorkout_SavesNewWorkout()
    {
        var addWorkoutPage = new AddWorkoutPage(Page);
        var historyPage = new WorkoutHistoryPage(Page);

        string title = $"E2E Workout {Guid.NewGuid()}";
        string copiedTitle = $"E2E Copied Workout {Guid.NewGuid()}";
        string notes = "testNotes";
        string exercise = "Barbell Bench Press";

        await addWorkoutPage.AddWorkoutAsync(title, notes, exercise, "1", "1", "1");

        await historyPage.CopyWorkoutAsync(title);

        await Expect(Page).ToHaveURLAsync(new Regex(".*/app/workouts/new/.*"));

        await Page.GetByLabel("Title").FillAsync(copiedTitle);

        await Page.GetByRole(AriaRole.Button, new PageGetByRoleOptions
        {
            Name = "Save workout"
        }).ClickAsync();

        await Expect(Page).ToHaveURLAsync(TestConfig.BaseUrl + "/app/workouts");
        await Expect(historyPage.WorkoutTitle(copiedTitle)).ToHaveCountAsync(2);
    }

    [Fact]
    public async Task DeleteWorkout_ExistingWorkout_RemovesWorkout()
    {
        var addWorkoutPage = new AddWorkoutPage(Page);
        var historyPage = new WorkoutHistoryPage(Page);

        string title = $"E2E Workout {Guid.NewGuid()}";
        string notes = "testNotes";
        string exercise = "Barbell Bench Press";

        await addWorkoutPage.AddWorkoutAsync(title, notes, exercise, "1", "1", "1");

        await Expect(historyPage.WorkoutTitle(title)).ToBeVisibleAsync();

        await historyPage.DeleteWorkoutAsync(title);

        await Expect(historyPage.WorkoutTitle(title)).Not.ToBeVisibleAsync();
    }

    [Fact]
    public async Task MakeTemplate_ExistingWorkout_CreatesTemplate()
    {
        var addWorkoutPage = new AddWorkoutPage(Page);
        var historyPage = new WorkoutHistoryPage(Page);

        string title = $"E2E Template Workout {Guid.NewGuid()}";
        string notes = "testNotes";
        string exercise = "Barbell Bench Press";

        await addWorkoutPage.AddWorkoutAsync(title, notes, exercise, "1", "1", "1");

        await historyPage.MakeTemplateAsync(title);

        await Expect(Page).ToHaveURLAsync(TestConfig.BaseUrl + "/app/templates");
        await Expect(Page.GetByText(title)).ToBeVisibleAsync();
    }
}