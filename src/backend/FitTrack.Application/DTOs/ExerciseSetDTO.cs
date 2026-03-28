namespace FitTrack.Application.DTOs
{
    public class ExerciseSetDTO
    {
        public required int SetNumber { get; set; }
        public int? Reps { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Rpe { get; set; }
        public bool? IsWarmup { get; set; }

    }
}
