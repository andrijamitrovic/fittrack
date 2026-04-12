namespace FitTrack.Domain.Entities
{
    public class Exercise
    {
        public Guid Id { get; set; } = Guid.Empty;
        public required string Name { get; set; }
        public required string Category { get; set; }
        public required string MuscleGroup { get; set; }
        public string? Description { get; set; }
        public required bool IsCustom { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}