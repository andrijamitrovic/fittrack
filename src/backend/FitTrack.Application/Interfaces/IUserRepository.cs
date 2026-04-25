using FitTrack.Application.Common;
using FitTrack.Domain.Entities;

namespace FitTrack.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<(ResultType Code, User? Data)> CreateUserAsync(User user);
        Task<User?> GetUserAsync(string email);
        Task<User?> GetUserByIdAsync(Guid userId);
        Task<IEnumerable<User>> GetUsersAsync();
        Task<ResultType> DeleteUser(Guid userId);
    }
}
