namespace FitTrack.Domain.Entities
{
    public class RefreshToken
    {
        public Guid Id { get; set; } = Guid.Empty;
        public required Guid UserId { get; set; }
        public required string Token { get; set; }
        public required DateTime ExpiresAt { get; set; }
        public required DateTime CreatedAt { get; set; }
    }
}