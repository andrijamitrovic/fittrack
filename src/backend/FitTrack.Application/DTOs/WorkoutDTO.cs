namespace FitTrack.Application.DTOs
{
    public class WorkoutDTO
    {
        public string? Title { get; set; }
        public string? Notes { get; set; }
        public int? DurationMin { get; set; }
        public required List<WorkoutExerciseDTO> WorkoutExercises { get; set; }
    }
}
