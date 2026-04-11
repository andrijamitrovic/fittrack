using FitTrack.E2ETests.Base;
using Xunit;

namespace FitTrack.E2ETests.Tests;

public class WorkoutTests : AuthenticatedPageTest
{
    [Fact]
    public async Task CheckAddWorkoutAsync()
    {
        var addWorkoutPage = new AddWorkoutPage(Page);
        string title = "testTitle";
        string notes = "testNotes";
        string selectOption = "Barbell Bench Press";
        string reps = "1";
        string weight = "1";
        string rpe = "1";

        await addWorkoutPage.AddWorkoutAsync(title, notes, selectOption, reps, weight, rpe);

        await Expect(Page).ToHaveURLAsync(TestConfig.BaseUrl + "/workouts");
    }
}