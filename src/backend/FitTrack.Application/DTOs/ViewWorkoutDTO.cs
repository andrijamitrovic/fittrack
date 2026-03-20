using System;
using System.Collections.Generic;
using System.Text;

namespace FitTrack.Application.DTOs
{
    public class ViewWorkoutDTO
    {
        public required Guid WorkoutId { get; set; }
        public string? Title { get; set; }
        public required DateTime Date { get; set; }
        public string? WorkoutNotes { get; set; }
        public int? DurationMin { get; set; }
        public required List<ViewExerciseDTO> Exercises { get; set; }
    }
}
