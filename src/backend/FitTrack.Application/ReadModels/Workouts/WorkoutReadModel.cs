namespace FitTrack.Application.ReadModels.Workouts
{
    public class WorkoutReadModel
    {
        public required Guid WorkoutId { get; set; }
        public string? Title { get; set; }
        public required DateTime Date { get; set; }
        public string? WorkoutNotes { get; set; }
        public int? DurationMin { get; set; }
        public required List<WorkoutExerciseReadModel> Exercises { get; set; }
    }
}
