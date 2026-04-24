using System.ComponentModel.DataAnnotations;

namespace FitTrack.Application.DTOs
{
    public class ExerciseDTO
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public required string Name { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 1)]
        public required string Category { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 1)]
        public required string MuscleGroup { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }
    }
}