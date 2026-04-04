using FitTrack.Domain.Entities;

namespace FitTrack.Application.Interfaces
{
    public interface IAuthRepository
    {
        public Task<RefreshToken?> CreateRefreshTokenAsync(Guid userId, string token);
        public Task DeleteRefreshTokenAsync(RefreshToken refreshToken);
        public Task<RefreshToken?> GetRefreshTokenAsync(string token);
    }
}
