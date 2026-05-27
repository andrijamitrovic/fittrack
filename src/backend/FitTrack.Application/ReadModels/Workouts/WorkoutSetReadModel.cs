namespace FitTrack.Application.ReadModels.Workouts
{
    public class WorkoutSetReadModel
    {
        public required int SetNumber { get; set; }
        public int? Reps { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Rpe { get; set; }
        public required bool IsWarmup { get; set; }
    }
}
