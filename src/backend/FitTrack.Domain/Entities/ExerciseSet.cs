namespace FitTrack.Domain.Entities
{
    public class ExerciseSet
    {
        public required Guid Id { get; set; }
        public required Guid WorkoutExerciseId { get; set; }
        public required int SetNumber { get; set; }
        public int? Reps { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Rpe { get; set; }
        public required bool IsWarmup { get; set; }
        public required bool Completed { get; set; }
    }
}
