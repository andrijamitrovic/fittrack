namespace FitTrack.Domain.Entities
{
    public class WorkoutExercise
    {
        public required Guid Id { get; set; }
        public required Guid WorkoutId { get; set; }
        public required Guid ExerciseId { get; set; }
        public required int OrderIndex { get; set; }
        public string? Notes { get; set; }
        public Workout? Workout { get; set; }
        public Exercise? Exercise { get; set; }
        public List<ExerciseSet> ExerciseSets { get; set; } = [];
    }
}
