using FitTrack.Application.Common;
using FitTrack.Domain.Entities;

namespace FitTrack.Application.Interfaces
{
    public interface IAuthRepository
    {
        Task<(ResultType Code, RefreshToken? Data)> CreateRefreshTokenAsync(Guid userId, string token);
        Task<ResultType> DeleteRefreshTokenAsync(RefreshToken refreshToken);
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
    }
}
