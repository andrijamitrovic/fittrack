using FitTrack.Application.Common;
using FitTrack.Application.DTOs;
using FitTrack.Application.Interfaces;
using FitTrack.Application.Services;
using FitTrack.Domain.Entities;
using Moq;

namespace FitTrack.Tests
{
    public class AuthServiceTests
    {
        private readonly Mock<IAuthRepository> _mockAuthRepo;
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly Dictionary<string, string> _jwtSettings = new()
        {
            { "Key", "this-is-a-test-secret-key-at-least-32-characters" },
            { "Issuer", "test" },
            { "Audience", "test" },
            { "ExpiryMinutes", "30" }
        };

        private readonly string _userEmail = "email@test.com";
        private readonly string _password = "password";
        private readonly string _passwordHash;
        private readonly string _displayName = "name";
        private readonly Guid _userId = Guid.NewGuid();
        private readonly Guid _tokenId = Guid.NewGuid();
        private readonly string _fakeRefreshToken = "fake-refresh-token";
        private readonly string _rotatedRefreshToken = "rotated-refresh-token";
        private readonly DateTime _expiresAt = DateTime.UtcNow.AddDays(30);
        private readonly DateTime _createdAt = DateTime.UtcNow;

        private readonly AuthService _service;

        public AuthServiceTests()
        {
            _passwordHash = BCrypt.Net.BCrypt.HashPassword(_password);
            _mockUserRepo = new Mock<IUserRepository>();
            _mockAuthRepo = new Mock<IAuthRepository>();
            _service = new AuthService(_mockUserRepo.Object, _mockAuthRepo.Object, _jwtSettings);
        }

        [Fact]
        public async Task RegisterAsync_ValidInput_ReturnsTokens()
        {
            _mockUserRepo.Setup(ur => ur.CreateUserAsync(It.IsAny<User>()))
                .ReturnsAsync((Code: ResultType.Success, Data: (User?)new User
                {
                    Id = _userId,
                    Email = _userEmail,
                    PasswordHash = _passwordHash,
                    DisplayName = _displayName,
                    Role = "user"
                }));

            _mockAuthRepo.Setup(ar => ar.CreateRefreshTokenAsync(It.IsAny<Guid>(), It.IsAny<string>()))
                .ReturnsAsync((Code: ResultType.Success, Data: (RefreshToken?)new RefreshToken
                {
                    Id = _tokenId,
                    UserId = _userId,
                    Token = _fakeRefreshToken,
                    ExpiresAt = _expiresAt,
                    CreatedAt = _createdAt
                }));

            var result = await _service.RegisterAsync(new RegisterDTO
            {
                Email = _userEmail,
                Password = _password,
                DisplayName = _displayName
            });

            Assert.Equal(ResultType.Success, result.Code);
            Assert.NotNull(result.Data);
            Assert.NotEmpty(result.Data.AccessToken);
            Assert.Equal(_fakeRefreshToken, result.Data.RefreshToken);
        }

        [Fact]
        public async Task RegisterAsync_DuplicateEmail_ReturnsConflict()
        {
            _mockUserRepo.Setup(ur => ur.CreateUserAsync(It.IsAny<User>()))
                .ReturnsAsync((Code: ResultType.Conflict, Data: (User?)null));

            var result = await _service.RegisterAsync(new RegisterDTO
            {
                Email = _userEmail,
                Password = _password,
                DisplayName = _displayName
            });

            Assert.Equal(ResultType.Conflict, result.Code);
            Assert.Null(result.Data);
        }

        [Fact]
        public async Task LoginAsync_ValidInput_ReturnsTokens()
        {
            _mockUserRepo.Setup(ur => ur.GetUserAsync(It.IsAny<string>()))
                .ReturnsAsync(new User
                {
                    Id = _userId,
                    Email = _userEmail,
                    PasswordHash = _passwordHash,
                    DisplayName = _displayName,
                    Role = "user"
                });

            _mockAuthRepo.Setup(ar => ar.CreateRefreshTokenAsync(It.IsAny<Guid>(), It.IsAny<string>()))
                .ReturnsAsync((Code: ResultType.Success, Data: (RefreshToken?)new RefreshToken
                {
                    Id = _tokenId,
                    UserId = _userId,
                    Token = _fakeRefreshToken,
                    ExpiresAt = _expiresAt,
                    CreatedAt = _createdAt
                }));

            var result = await _service.LoginAsync(new LoginDTO
            {
                Email = _userEmail,
                Password = _password
            });

            Assert.Equal(ResultType.Success, result.Code);
            Assert.NotNull(result.Data);
            Assert.NotEmpty(result.Data.AccessToken);
            Assert.Equal(_fakeRefreshToken, result.Data.RefreshToken);
        }

        [Fact]
        public async Task LoginAsync_WrongPassword_ReturnsUnauthorized()
        {
            _mockUserRepo.Setup(ur => ur.GetUserAsync(It.IsAny<string>()))
                .ReturnsAsync(new User
                {
                    Id = _userId,
                    Email = _userEmail,
                    PasswordHash = _passwordHash,
                    DisplayName = _displayName,
                    Role = "user"
                });

            var result = await _service.LoginAsync(new LoginDTO
            {
                Email = _userEmail,
                Password = "wrong-password"
            });

            Assert.Equal(ResultType.Unauthorized, result.Code);
            Assert.Null(result.Data);
            _mockAuthRepo.Verify(ar => ar.CreateRefreshTokenAsync(It.IsAny<Guid>(), It.IsAny<string>()), Times.Never);
        }

        [Fact]
        public async Task LoginAsync_NonexistentEmail_ReturnsUnauthorized()
        {
            _mockUserRepo.Setup(ur => ur.GetUserAsync(It.IsAny<string>()))
                .ReturnsAsync((User?)null);

            var result = await _service.LoginAsync(new LoginDTO
            {
                Email = _userEmail,
                Password = _password
            });

            Assert.Equal(ResultType.Unauthorized, result.Code);
            Assert.Null(result.Data);
        }

        [Fact]
        public async Task RefreshTokenAsync_ValidInput_ReturnsTokens()
        {
            _mockAuthRepo.Setup(ar => ar.GetRefreshTokenAsync(It.IsAny<string>()))
                .ReturnsAsync(new RefreshToken
                {
                    Id = _tokenId,
                    UserId = _userId,
                    Token = _fakeRefreshToken,
                    ExpiresAt = _expiresAt,
                    CreatedAt = _createdAt
                });

            _mockUserRepo.Setup(ur => ur.GetUserByIdAsync(It.IsAny<Guid>()))
                .ReturnsAsync(new User
                {
                    Id = _userId,
                    Email = _userEmail,
                    PasswordHash = _passwordHash,
                    DisplayName = _displayName,
                    Role = "user"
                });

            _mockAuthRepo.Setup(ar => ar.DeleteRefreshTokenAsync(It.IsAny<RefreshToken>()))
                .ReturnsAsync(ResultType.Success);

            _mockAuthRepo.Setup(ar => ar.CreateRefreshTokenAsync(It.IsAny<Guid>(), It.IsAny<string>()))
                .ReturnsAsync((Code: ResultType.Success, Data: (RefreshToken?)new RefreshToken
                {
                    Id = Guid.NewGuid(),
                    UserId = _userId,
                    Token = _rotatedRefreshToken,
                    ExpiresAt = _expiresAt,
                    CreatedAt = _createdAt
                }));

            var result = await _service.RefreshTokenAsync(_fakeRefreshToken);

            Assert.Equal(ResultType.Success, result.Code);
            Assert.NotNull(result.Data);
            Assert.NotEmpty(result.Data.AccessToken);
            Assert.Equal(_rotatedRefreshToken, result.Data.RefreshToken);
        }

        [Fact]
        public async Task RefreshTokenAsync_InvalidToken_ReturnsUnauthorized()
        {
            _mockAuthRepo.Setup(ar => ar.GetRefreshTokenAsync(It.IsAny<string>()))
                .ReturnsAsync((RefreshToken?)null);

            var result = await _service.RefreshTokenAsync(_fakeRefreshToken);

            Assert.Equal(ResultType.Unauthorized, result.Code);
            Assert.Null(result.Data);
        }

        [Fact]
        public async Task RefreshTokenAsync_UserMissing_ReturnsUnauthorized()
        {
            _mockAuthRepo.Setup(ar => ar.GetRefreshTokenAsync(It.IsAny<string>()))
                .ReturnsAsync(new RefreshToken
                {
                    Id = _tokenId,
                    UserId = _userId,
                    Token = _fakeRefreshToken,
                    ExpiresAt = _expiresAt,
                    CreatedAt = _createdAt
                });

            _mockUserRepo.Setup(ur => ur.GetUserByIdAsync(It.IsAny<Guid>()))
                .ReturnsAsync((User?)null);

            var result = await _service.RefreshTokenAsync(_fakeRefreshToken);

            Assert.Equal(ResultType.Unauthorized, result.Code);
            Assert.Null(result.Data);
            _mockAuthRepo.Verify(ar => ar.DeleteRefreshTokenAsync(It.IsAny<RefreshToken>()), Times.Never);
        }

        [Fact]
        public async Task RefreshTokenAsync_DeleteRefreshTokenNotFound_ReturnsUnauthorized()
        {
            _mockAuthRepo.Setup(ar => ar.GetRefreshTokenAsync(It.IsAny<string>()))
                .ReturnsAsync(new RefreshToken
                {
                    Id = _tokenId,
                    UserId = _userId,
                    Token = _fakeRefreshToken,
                    ExpiresAt = _expiresAt,
                    CreatedAt = _createdAt
                });

            _mockUserRepo.Setup(ur => ur.GetUserByIdAsync(It.IsAny<Guid>()))
                .ReturnsAsync(new User
                {
                    Id = _userId,
                    Email = _userEmail,
                    PasswordHash = _passwordHash,
                    DisplayName = _displayName,
                    Role = "user"
                });

            _mockAuthRepo.Setup(ar => ar.DeleteRefreshTokenAsync(It.IsAny<RefreshToken>()))
                .ReturnsAsync(ResultType.NotFound);

            var result = await _service.RefreshTokenAsync(_fakeRefreshToken);

            Assert.Equal(ResultType.Unauthorized, result.Code);
            Assert.Null(result.Data);
            _mockAuthRepo.Verify(ar => ar.CreateRefreshTokenAsync(It.IsAny<Guid>(), It.IsAny<string>()), Times.Never);
        }

        [Fact]
        public async Task RefreshTokenAsync_NewRefreshTokenFails_ReturnsFailure()
        {
            _mockAuthRepo.Setup(ar => ar.GetRefreshTokenAsync(It.IsAny<string>()))
                .ReturnsAsync(new RefreshToken
                {
                    Id = _tokenId,
                    UserId = _userId,
                    Token = _fakeRefreshToken,
                    ExpiresAt = _expiresAt,
                    CreatedAt = _createdAt
                });

            _mockUserRepo.Setup(ur => ur.GetUserByIdAsync(It.IsAny<Guid>()))
                .ReturnsAsync(new User
                {
                    Id = _userId,
                    Email = _userEmail,
                    PasswordHash = _passwordHash,
                    DisplayName = _displayName,
                    Role = "user"
                });

            _mockAuthRepo.Setup(ar => ar.DeleteRefreshTokenAsync(It.IsAny<RefreshToken>()))
                .ReturnsAsync(ResultType.Success);

            _mockAuthRepo.Setup(ar => ar.CreateRefreshTokenAsync(It.IsAny<Guid>(), It.IsAny<string>()))
                .ReturnsAsync((Code: ResultType.Failure, Data: (RefreshToken?)null));

            var result = await _service.RefreshTokenAsync(_fakeRefreshToken);

            Assert.Equal(ResultType.Failure, result.Code);
            Assert.Null(result.Data);
        }

        [Fact]
        public async Task GetUsersAsync_ReturnsMappedUsers()
        {
            _mockUserRepo.Setup(ur => ur.GetUsersAsync())
                .ReturnsAsync(new List<User>
                {
                    new User
                    {
                        Id = _userId,
                        Email = _userEmail,
                        PasswordHash = _passwordHash,
                        DisplayName = _displayName,
                        CreatedAt = _createdAt,
                        UpdatedAt = _createdAt,
                        Role = "admin"
                    }
                });

            var result = await _service.GetUsersAsync();

            Assert.Equal(ResultType.Success, result.Code);
            Assert.Single(result.Data);
            Assert.Equal(_userEmail, result.Data[0].Email);
            Assert.Equal("admin", result.Data[0].Role);
        }

        [Fact]
        public async Task DeleteUserAsync_Success_ReturnsSuccess()
        {
            _mockUserRepo.Setup(ur => ur.DeleteUser(_userId))
                .ReturnsAsync(ResultType.Success);

            var result = await _service.DeleteUserAsync(_userId);

            Assert.Equal(ResultType.Success, result.Code);
            Assert.True(result.Data);
        }

        [Fact]
        public async Task DeleteUserAsync_NotFound_ReturnsNotFound()
        {
            _mockUserRepo.Setup(ur => ur.DeleteUser(_userId))
                .ReturnsAsync(ResultType.NotFound);

            var result = await _service.DeleteUserAsync(_userId);

            Assert.Equal(ResultType.NotFound, result.Code);
            Assert.False(result.Data);
        }
    }
}
