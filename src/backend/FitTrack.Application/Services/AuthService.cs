using FitTrack.Application.DTOs;
using FitTrack.Application.Interfaces;
using FitTrack.Domain.Entities;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace FitTrack.Application.Services
{
    public class AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly Dictionary<string, string> _jwtSettings;

        public AuthService(IUserRepository userRepository, Dictionary<string, string> jwtSettings)
        {
            _userRepository = userRepository;
            _jwtSettings = jwtSettings;
        }

        public async Task<User?> CreateUser(RegisterDTO userDTO)
        {
            return await _userRepository.CreateUserAsync(new User
            {
                Email = userDTO.Email,
                DisplayName = userDTO.DisplayName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDTO.Password),
            });
        }

        public async Task<string?> GetUserAsync(LoginDTO loginDTO)
        {
            User? user = await _userRepository.GetUserAsync(loginDTO.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.PasswordHash))
            {
                return null;
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings["Key"]));

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, loginDTO.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
            issuer: _jwtSettings["Issuer"],
            audience: _jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_jwtSettings["ExpiryMinutes"])),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}