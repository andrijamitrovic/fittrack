namespace FitTrack.Domain.Entities;

public class WorkoutTemplateDetailRow
{
        public required Guid WorkoutId { get; set; }
        public required string Title { get; set; }
        public required Guid WorkoutExerciseId { get; set; }
        public required int OrderIndex { get; set; }
        public required string ExerciseName { get; set; }
        public required string Category { get; set; }
        public required string MuscleGroup { get; set; }
        public required int SetNumber { get; set; }
        public required int Reps { get; set; }
        public decimal? Weight { get; set; }
}