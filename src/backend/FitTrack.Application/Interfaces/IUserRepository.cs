using FitTrack.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace FitTrack.Application.Interfaces
{
    public interface IUserRepository
    {
        public Task<User?> CreateUserAsync(User user);
        public Task<User?> GetUserAsync(string email);
        public Task<User?> GetUserByIdAsync(Guid userId);
        public Task<IEnumerable<User>> GetUsersAsync();
        public Task<bool> DeleteUser(Guid userId);
    }
}
