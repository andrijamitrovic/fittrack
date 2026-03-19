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
    }
}
