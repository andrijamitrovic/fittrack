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
        private readonly IAuthRepository _authRepository;
        private readonly Dictionary<string, string> _jwtSettings;

        public AuthService(IUserRepository userRepository, IAuthRepository authRepository, Dictionary<string, string> jwtSettings)
        {
            _authRepository = authRepository;
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

        public async Task<AuthToken?> GetUserAsync(LoginDTO loginDTO)
        {
            User? user = await _userRepository.GetUserAsync(loginDTO.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.PasswordHash))
            {
                return null;
            }


            
            return new AuthToken {
                AccessToken = GenerateJWT(user.Id, loginDTO.Email),
                RefreshToken = (await CreateRefreshTokenAsync(user.Id))!.Token
            };
        }

        public async Task<RefreshToken?> CreateRefreshTokenAsync(Guid userId)
        {
            string token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            return await _authRepository.CreateRefreshTokenAsync(userId, token);
        }

        public async Task<AuthToken?> VerifyTokenAsync(string token)
        {
            RefreshToken? existingRefreshToken = await _authRepository.GetRefreshTokenAsync(token);
            if (existingRefreshToken is null)
            {
                return null;
            }

            await _authRepository.DeleteRefreshTokenAsync(existingRefreshToken);

            RefreshToken? newRefreshToken = await CreateRefreshTokenAsync(existingRefreshToken.UserId);

            User? user = await _userRepository.GetUserByIdAsync(existingRefreshToken.UserId);

            if(user == null)
            {
                return null;
            }

            if(newRefreshToken == null)
            {
                return null;
            }

            string accessToken = GenerateJWT(user.Id, user.Email);

            return new AuthToken { AccessToken = accessToken, RefreshToken = newRefreshToken.Token};
        }

        public string GenerateJWT(Guid userId, string uniqueName)
        {

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings["Key"]));

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, uniqueName),
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