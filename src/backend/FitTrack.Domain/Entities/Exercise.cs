namespace FitTrack.Domain.Entities
{
    public class Exercise
    {
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Category { get; set; }
        public required string MuscleGroup { get; set; }
        public string? Description { get; set; }
        public required bool IsCustom { get; set; }
        public Guid? CreatedBy { get; set; }
        public required DateTime CreatedAt { get; set; }
    }
}