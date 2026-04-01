namespace FitTrack.Domain.Entities
{
    public class WorkoutDetailRow
    {
        public required Guid WorkoutId { get; set; }
        public string? Title { get; set; }
        public required DateTime Date { get; set; }
        public string? WorkoutNotes { get; set; }
        public int? DurationMin { get; set; }
        public required Guid WorkoutExerciseId { get; set; }
        public required Guid ExerciseId { get; set; }
        public required int OrderIndex { get; set; }
        public string? ExerciseNotes { get; set; }
        public required string ExerciseName { get; set; }
        public required string Category { get; set; }
        public required string MuscleGroup { get; set; }
        public required int SetNumber { get; set; }
        public int? Reps { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Rpe { get; set; }
        public required bool IsWarmup { get; set; }
    }
}
