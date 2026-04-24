using System.ComponentModel.DataAnnotations;

namespace FitTrack.Application.DTOs
{
    public class ExerciseSetDTO
    {
        [Range(1, int.MaxValue)]
        public required int SetNumber { get; set; }

        [Range(0, int.MaxValue)]
        public int? Reps { get; set; }

        [Range(typeof(decimal), "0", "1000")]
        public decimal? Weight { get; set; }

        [Range(typeof(decimal), "0", "10")]
        public decimal? Rpe { get; set; }
        public bool? IsWarmup { get; set; }

    }
}
