using System;
using System.Collections.Generic;
using System.Text;

namespace FitTrack.Application.DTOs
{
    public class ViewExerciseDTO
    {
        public required Guid WorkoutExerciseId { get; set; }
        public required int OrderIndex { get; set; }
        public string? ExerciseNotes { get; set; }
        public required string ExerciseName { get; set; }
        public required string Category { get; set; }
        public required string MuscleGroup { get; set; }
        public required List<ViewSetDTO> Sets { get; set; }
    }
}
