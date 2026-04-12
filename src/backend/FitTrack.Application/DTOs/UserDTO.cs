namespace FitTrack.Domain.Entities
{
    public class UserDTO
    {
        public Guid Id { get; set; } = Guid.Empty;
        public required string Email { get; set; }
        public required string DisplayName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Role { get; set; } = "user";
    }
}