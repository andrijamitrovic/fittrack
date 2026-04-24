using System.ComponentModel.DataAnnotations;

namespace FitTrack.Application.DTOs
{
    public class WorkoutExerciseDTO
    {
        [Required]
        public required Guid ExerciseId { get; set; }

        [Range(0, int.MaxValue)]
        public required int OrderIndex { get; set; }

        [StringLength(2000)]
        public string? Notes { get; set; }

        [Required]
        [MinLength(1)]
        public required List<ExerciseSetDTO> ExerciseSets { get; set; }
    }
}
