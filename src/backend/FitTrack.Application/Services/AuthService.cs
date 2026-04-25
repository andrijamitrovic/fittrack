using FitTrack.Application.Common;
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

        public AuthService(
            IUserRepository userRepository,
            IAuthRepository authRepository,
            Dictionary<string, string> jwtSettings)
        {
            _userRepository = userRepository;
            _authRepository = authRepository;
            _jwtSettings = jwtSettings;
        }

        public async Task<ServiceResult<AuthToken?>> RegisterAsync(RegisterDTO userDTO)
        {
            var createUserResult = await _userRepository.CreateUserAsync(new User
            {
                Email = userDTO.Email,
                DisplayName = userDTO.DisplayName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDTO.Password)
            });

            if (createUserResult.Code != ResultType.Success || createUserResult.Data is not User user)
            {
                return new ServiceResult<AuthToken?>
                {
                    Code = createUserResult.Code,
                    Data = null,
                    Message = createUserResult.Code switch
                    {
                        ResultType.Conflict => "A user with the same email address already exists.",
                        _ => "User could not be created."
                    }
                };
            }

            var refreshTokenResult = await CreateRefreshTokenAsync(user.Id);
            if (refreshTokenResult.Code != ResultType.Success || refreshTokenResult.Data is not RefreshToken refreshToken)
            {
                return new ServiceResult<AuthToken?>
                {
                    Code = ResultType.Failure,
                    Data = null,
                    Message = "User was created, but authentication tokens could not be created."
                };
            }

            return new ServiceResult<AuthToken?>
            {
                Code = ResultType.Success,
                Data = new AuthToken
                {
                    AccessToken = GenerateJWT(user.Id, user.Email, user.Role),
                    RefreshToken = refreshToken.Token
                },
                Message = "User registered successfully."
            };
        }

        public async Task<ServiceResult<AuthToken?>> LoginAsync(LoginDTO loginDTO)
        {
            User? user = await _userRepository.GetUserAsync(loginDTO.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.PasswordHash))
            {
                return new ServiceResult<AuthToken?>
                {
                    Code = ResultType.Unauthorized,
                    Data = null,
                    Message = "Invalid username or password."
                };
            }

            var refreshTokenResult = await CreateRefreshTokenAsync(user.Id);
            if (refreshTokenResult.Code != ResultType.Success || refreshTokenResult.Data is not RefreshToken refreshToken)
            {
                return new ServiceResult<AuthToken?>
                {
                    Code = ResultType.Failure,
                    Data = null,
                    Message = "Authentication tokens could not be created."
                };
            }

            return new ServiceResult<AuthToken?>
            {
                Code = ResultType.Success,
                Data = new AuthToken
                {
                    AccessToken = GenerateJWT(user.Id, user.Email, user.Role),
                    RefreshToken = refreshToken.Token
                },
                Message = "Login successful."
            };
        }

        public async Task<ServiceResult<AuthToken?>> RefreshTokenAsync(string token)
        {
            RefreshToken? existingRefreshToken = await _authRepository.GetRefreshTokenAsync(token);
            if (existingRefreshToken is null)
            {
                return new ServiceResult<AuthToken?>
                {
                    Code = ResultType.Unauthorized,
                    Data = null,
                    Message = "Invalid or expired refresh token."
                };
            }

            User? user = await _userRepository.GetUserByIdAsync(existingRefreshToken.UserId);
            if (user is null)
            {
                return new ServiceResult<AuthToken?>
                {
                    Code = ResultType.Unauthorized,
                    Data = null,
                    Message = "User not found for refresh token."
                };
            }

            var deleteCode = await _authRepository.DeleteRefreshTokenAsync(existingRefreshToken);
            if (deleteCode != ResultType.Success)
            {
                return new ServiceResult<AuthToken?>
                {
                    Code = deleteCode == ResultType.NotFound ? ResultType.Unauthorized : ResultType.Failure,
                    Data = null,
                    Message = deleteCode == ResultType.NotFound
                        ? "Refresh token is no longer valid."
                        : "Refresh token could not be rotated."
                };
            }

            var newRefreshTokenResult = await CreateRefreshTokenAsync(user.Id);
            if (newRefreshTokenResult.Code != ResultType.Success || newRefreshTokenResult.Data is not RefreshToken newRefreshToken)
            {
                return new ServiceResult<AuthToken?>
                {
                    Code = ResultType.Failure,
                    Data = null,
                    Message = "New refresh token could not be created."
                };
            }

            return new ServiceResult<AuthToken?>
            {
                Code = ResultType.Success,
                Data = new AuthToken
                {
                    AccessToken = GenerateJWT(user.Id, user.Email, user.Role),
                    RefreshToken = newRefreshToken.Token
                },
                Message = "Token refreshed successfully."
            };
        }

        public async Task<ServiceResult<List<UserDTO>>> GetUsersAsync()
        {
            var users = await _userRepository.GetUsersAsync();

            return new ServiceResult<List<UserDTO>>
            {
                Code = ResultType.Success,
                Data = users.Select(user => new UserDTO
                {
                    Id = user.Id,
                    Email = user.Email,
                    DisplayName = user.DisplayName,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt,
                    Role = user.Role
                }).ToList(),
                Message = "Users returned successfully."
            };
        }

        public async Task<ServiceResult<bool>> DeleteUserAsync(Guid userId)
        {
            var code = await _userRepository.DeleteUser(userId);

            return new ServiceResult<bool>
            {
                Code = code,
                Data = code == ResultType.Success,
                Message = code switch
                {
                    ResultType.Success => "User deleted successfully.",
                    ResultType.NotFound => "User not found.",
                    _ => "User could not be deleted."
                }
            };
        }

        private async Task<ServiceResult<RefreshToken?>> CreateRefreshTokenAsync(Guid userId)
        {
            for (int attempt = 0; attempt < 3; attempt++)
            {
                string token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
                var repoResult = await _authRepository.CreateRefreshTokenAsync(userId, token);

                if (repoResult.Code == ResultType.Conflict)
                {
                    continue;
                }

                return new ServiceResult<RefreshToken?>
                {
                    Code = repoResult.Code,
                    Data = repoResult.Data,
                    Message = repoResult.Code switch
                    {
                        ResultType.Success => "Refresh token created successfully.",
                        ResultType.NotFound => "User not found for refresh token creation.",
                        _ => "Refresh token could not be created."
                    }
                };
            }

            return new ServiceResult<RefreshToken?>
            {
                Code = ResultType.Failure,
                Data = null,
                Message = "Refresh token could not be created."
            };
        }

        public string GenerateJWT(Guid userId, string uniqueName, string role)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings["Key"]));

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, uniqueName),
                new Claim(ClaimTypes.Role, role),
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
