namespace FitTrack.Domain.Entities
{
    public class Workout
    {
        public required Guid Id { get; set; }
        public required Guid UserId { get; set; }
        public string? Title { get; set; }
        public required DateTime Date { get; set; }
        public string? Notes { get; set; }
        public int? DurationMin { get; set; }
        public required DateTime CreatedAt { get; set; }
        public required DateTime UpdatedAt { get; set; }
    }
}