namespace FitTrack.Domain.Entities
{
    public class ExerciseDTO
    {
        public required string Name { get; set; }
        public required string Category { get; set; }
        public required string MuscleGroup { get; set; }
        public string? Description { get; set; }
    }
}