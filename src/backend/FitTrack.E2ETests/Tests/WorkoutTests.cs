using FitTrack.E2ETests.Base;
using FitTrack.E2ETests.PageObjects;
using Xunit;

namespace FitTrack.E2ETests.Tests;

public class WorkoutTests : AuthenticatedPageTest
{
    [Fact]
    public async Task AddWorkout_ValidInput_SavesWorkout()
    {
        var addWorkoutPage = new AddWorkoutPage(Page);
        string title = Guid.NewGuid().ToString();
        string notes = "testNotes";
        string selectOption = "Barbell Bench Press";
        string reps = "1";
        string weight = "1";
        string rpe = "1";

        await addWorkoutPage.AddWorkoutAsync(title, notes, selectOption, reps, weight, rpe);

        await Expect(Page).ToHaveURLAsync(TestConfig.BaseUrl + "/app/workouts");
        await Expect(Page.GetByText(title)).ToBeVisibleAsync();
    }
}