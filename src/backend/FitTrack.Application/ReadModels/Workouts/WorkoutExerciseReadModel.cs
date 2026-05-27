namespace FitTrack.Application.ReadModels.Workouts
{
    public class WorkoutExerciseReadModel
    {
        public required Guid WorkoutExerciseId { get; set; }
        public required Guid ExerciseId { get; set; }
        public required int OrderIndex { get; set; }
        public string? ExerciseNotes { get; set; }
        public required string ExerciseName { get; set; }
        public required string Category { get; set; }
        public required string MuscleGroup { get; set; }
        public required List<WorkoutSetReadModel> Sets { get; set; }
    }
}
