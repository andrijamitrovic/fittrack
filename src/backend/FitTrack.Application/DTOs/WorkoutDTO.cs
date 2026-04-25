using System.ComponentModel.DataAnnotations;

namespace FitTrack.Application.DTOs
{
    public class WorkoutDTO
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string? Title { get; set; }

        [StringLength(4000)]
        public string? Notes { get; set; }

        [Range(1, 1440)]
        public int? DurationMin { get; set; }

        [Required]
        [MinLength(1)]
        public required List<WorkoutExerciseDTO> WorkoutExercises { get; set; }
    }
}
