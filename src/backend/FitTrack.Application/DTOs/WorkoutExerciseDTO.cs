namespace FitTrack.Application.DTOs
{
    public class WorkoutExerciseDTO
    {
        public required Guid ExerciseId { get; set; }
        public required int OrderIndex { get; set; }
        public string? Notes { get; set; }
        public required List<ExerciseSetDTO> ExerciseSets { get; set; }
    }
}
