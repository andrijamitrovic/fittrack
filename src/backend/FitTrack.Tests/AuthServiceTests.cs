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
        private readonly Dictionary<string, string> _jwtSettings = new Dictionary<string, string>
        {
            { "Key", "this-is-a-test-secret-key-at-least-32-characters" },
            { "Issuer", "test" },
            { "Audience", "test" },
            { "ExpiryMinutes", "30" }
        };

        private readonly string _userEmail = "email";
        private readonly string _password = "password";
        private readonly string _passwordHash;
        private readonly string _displayName = "name";
        private readonly Guid _userId = Guid.NewGuid();
        private readonly Guid _tokenId = Guid.NewGuid();
        private readonly string _fakeRefreshToken = "fake-refresh-token";
        private readonly DateTime _expiresAt = DateTime.Now.AddDays(30);
        private readonly DateTime _createdAt = DateTime.Now;


        private readonly AuthService _service;

        public AuthServiceTests()
        {
            _passwordHash = BCrypt.Net.BCrypt.HashPassword(_password);
            _mockUserRepo = new Mock<IUserRepository>();
            _mockAuthRepo = new Mock<IAuthRepository>();
            _service = new AuthService(_mockUserRepo.Object, _mockAuthRepo.Object, _jwtSettings);
        }

        [Fact]
        public async Task CreateUser_ValidInput_ReturnsUser()
        {
            _mockUserRepo.Setup(ur => ur.CreateUserAsync(
                It.IsAny<User>()
            )).ReturnsAsync(new User
            {
                Email = _userEmail,
                PasswordHash = _passwordHash,
                DisplayName = _displayName
            });

            User? result = await _service.CreateUser(new RegisterDTO
            {
                Email = _userEmail,
                Password = _password,
                DisplayName = _displayName
            });

            Assert.NotNull(result);
            Assert.Equal(_userEmail, result.Email);
            Assert.Equal(_displayName, result.DisplayName);
        }

        [Fact]
        public async Task CreateUser_DuplicateEmail_ReturnsNull()
        {
            _mockUserRepo.Setup(ur => ur.CreateUserAsync(
                It.IsAny<User>()
            )).ReturnsAsync((User?)null);

            User? result = await _service.CreateUser(new RegisterDTO
            {
                Email = _userEmail,
                Password = _password,
                DisplayName = _displayName
            });

            Assert.Null(result);
        }

        [Fact]
        public async Task GetUser_ValidInput_ReturnsAuthTokens()
        {
            _mockUserRepo.Setup(ur => ur.GetUserAsync(
                It.IsAny<string>()
            )).ReturnsAsync(new User
            {
                Email = _userEmail,
                PasswordHash = _passwordHash,
                DisplayName = _displayName
            });

            _mockAuthRepo.Setup(ar => ar.CreateRefreshTokenAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>()
            )).ReturnsAsync(new RefreshToken
            {
                Id = _tokenId,
                UserId = _userId,
                Token = _fakeRefreshToken,
                ExpiresAt = _expiresAt,
                CreatedAt = _createdAt
            });

            AuthToken? result = await _service.GetUserAsync(new LoginDTO
            {
                Email = _userEmail,
                Password = _password
            });

            Assert.NotNull(result);
            Assert.NotEmpty(result.AccessToken);
            Assert.NotEmpty(result.RefreshToken);
        }

        [Fact]
        public async Task GetUser_WrongPassword_ReturnsNull()
        {
            _mockUserRepo.Setup(ur => ur.GetUserAsync(
                It.IsAny<string>()
            )).ReturnsAsync((User?)null);

            _mockAuthRepo.Setup(ar => ar.CreateRefreshTokenAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>()
            )).ReturnsAsync(new RefreshToken
            {
                Id = _tokenId,
                UserId = _userId,
                Token = _fakeRefreshToken,
                ExpiresAt = _expiresAt,
                CreatedAt = _createdAt
            });

            AuthToken? result = await _service.GetUserAsync(new LoginDTO
            {
                Email = _userEmail,
                Password = _password
            });

            Assert.Null(result);
        }

        [Fact]
        public async Task GetUser_NonexistentEmail_ReturnsNull()
        {
            _mockUserRepo.Setup(ur => ur.GetUserAsync(
                It.IsAny<string>()
            )).ReturnsAsync((User?)null);

            _mockAuthRepo.Setup(ar => ar.CreateRefreshTokenAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>()
            )).ReturnsAsync(new RefreshToken
            {
                Id = _tokenId,
                UserId = _userId,
                Token = _fakeRefreshToken,
                ExpiresAt = _expiresAt,
                CreatedAt = _createdAt
            });

            AuthToken? result = await _service.GetUserAsync(new LoginDTO
            {
                Email = _userEmail,
                Password = _password
            });

            Assert.Null(result);
        }

        [Fact]
        public async Task CreateRefreshToken_ValidInput_ReturnsRefreshToken()
        {
            _mockAuthRepo.Setup(ar => ar.CreateRefreshTokenAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>()
            )).ReturnsAsync(new RefreshToken
            {
                Id = _tokenId,
                UserId = _userId,
                Token = _fakeRefreshToken,
                ExpiresAt = _expiresAt,
                CreatedAt = _createdAt
            });

            RefreshToken? result = await _service.CreateRefreshTokenAsync(_userId);

            Assert.NotNull(result);
        }



        [Fact]
        public async Task CreateRefreshToken_InvalidUserId_ReturnsNull()
        {
            _mockAuthRepo.Setup(ar => ar.CreateRefreshTokenAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>()
            )).ReturnsAsync((RefreshToken?)null);

            RefreshToken? result = await _service.CreateRefreshTokenAsync(_userId);

            Assert.Null(result);
        }

        [Fact]
        public async Task VerifyToken_ValidInput_ReturnAuthTokens()
        {
            _mockAuthRepo.Setup(ar => ar.GetRefreshTokenAsync(
                It.IsAny<string>()
            )).ReturnsAsync(new RefreshToken
            {
                Id = _tokenId,
                UserId = _userId,
                Token = _fakeRefreshToken,
                ExpiresAt = _expiresAt,
                CreatedAt = _createdAt
            });

            _mockAuthRepo.Setup(ar => ar.CreateRefreshTokenAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>()
            )).ReturnsAsync(new RefreshToken
            {
                Id = _tokenId,
                UserId = _userId,
                Token = _fakeRefreshToken,
                ExpiresAt = _expiresAt,
                CreatedAt = _createdAt
            });

            _mockAuthRepo.Setup(ar => ar.DeleteRefreshTokenAsync(
                It.IsAny<RefreshToken>()
            )).Returns(Task.CompletedTask);

            _mockUserRepo.Setup(ur => ur.GetUserByIdAsync(
                It.IsAny<Guid>()
            )).ReturnsAsync(new User
            {
                Email = _userEmail,
                PasswordHash = _passwordHash,
                DisplayName = _displayName
            });


            AuthToken? result = await _service.VerifyTokenAsync(_fakeRefreshToken);

            Assert.NotNull(result);
        }

        [Fact]
        public async Task VerifyToken_InvalidToken_ReturnNull()
        {
            _mockAuthRepo.Setup(ar => ar.GetRefreshTokenAsync(
                It.IsAny<string>()
            )).ReturnsAsync((RefreshToken?)null);

            _mockAuthRepo.Setup(ar => ar.CreateRefreshTokenAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>()
            )).ReturnsAsync((RefreshToken?)null);

            _mockAuthRepo.Setup(ar => ar.DeleteRefreshTokenAsync(
                It.IsAny<RefreshToken>()
            )).Returns(Task.CompletedTask);

            _mockUserRepo.Setup(ur => ur.GetUserByIdAsync(
                It.IsAny<Guid>()
            )).ReturnsAsync((User?)null);


            AuthToken? result = await _service.VerifyTokenAsync(_fakeRefreshToken);

            Assert.Null(result);
        }

        [Fact]
        public async Task VerifyToken_InvalidNewToken_ReturnNull()
        {
            _mockAuthRepo.Setup(ar => ar.GetRefreshTokenAsync(
                It.IsAny<string>()
            )).ReturnsAsync(new RefreshToken
            {
                Id = _tokenId,
                UserId = _userId,
                Token = _fakeRefreshToken,
                ExpiresAt = _expiresAt,
                CreatedAt = _createdAt
            });

            _mockAuthRepo.Setup(ar => ar.CreateRefreshTokenAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>()
            )).ReturnsAsync((RefreshToken?)null);

            _mockAuthRepo.Setup(ar => ar.DeleteRefreshTokenAsync(
                It.IsAny<RefreshToken>()
            )).Returns(Task.CompletedTask);

            _mockUserRepo.Setup(ur => ur.GetUserByIdAsync(
                It.IsAny<Guid>()
            )).ReturnsAsync((User?)null);


            AuthToken? result = await _service.VerifyTokenAsync(_fakeRefreshToken);

            Assert.Null(result);
        }

        [Fact]
        public async Task VerifyToken_InvalidUser_ReturnNull()
        {
            _mockAuthRepo.Setup(ar => ar.GetRefreshTokenAsync(
                It.IsAny<string>()
            )).ReturnsAsync(new RefreshToken
            {
                Id = _tokenId,
                UserId = _userId,
                Token = _fakeRefreshToken,
                ExpiresAt = _expiresAt,
                CreatedAt = _createdAt
            });

            _mockAuthRepo.Setup(ar => ar.CreateRefreshTokenAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>()
            )).ReturnsAsync((RefreshToken?)null);

            _mockAuthRepo.Setup(ar => ar.DeleteRefreshTokenAsync(
                It.IsAny<RefreshToken>()
            )).Returns(Task.CompletedTask);

            _mockUserRepo.Setup(ur => ur.GetUserByIdAsync(
                It.IsAny<Guid>()
            )).ReturnsAsync(new User
            {
                Email = _userEmail,
                PasswordHash = _passwordHash,
                DisplayName = _displayName
            });


            AuthToken? result = await _service.VerifyTokenAsync(_fakeRefreshToken);

            Assert.Null(result);
        }
    }
}
