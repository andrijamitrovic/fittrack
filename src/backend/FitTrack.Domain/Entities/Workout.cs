namespace FitTrack.Domain.Entities
{
    public class Workout
    {
        public required Guid Id { get; set; }
        public required Guid UserId { get; set; }
        public string? Title { get; set; }
        public DateTime? Date { get; set; }
        public string? Notes { get; set; }
        public int? DurationMin { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsTemplate { get; set; }
    }
}