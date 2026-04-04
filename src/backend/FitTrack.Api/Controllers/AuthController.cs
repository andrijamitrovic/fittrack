using FitTrack.Application.DTOs;
using FitTrack.Application.Services;
using FitTrack.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace FitTrack.Api.Controllers
{
    [ApiController]
    [Route("/api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> Regiser(RegisterDTO registerDTO)
        {
            User? user = await _authService.CreateUser(registerDTO);
            if (user == null)
            {
                return Conflict(new
                {
                    status = 409,
                    message = "A user with the same email address already exists. Please use a different email."
                });
            }
            else
            {
                return await Login(new LoginDTO { Email = user.Email , Password = registerDTO.Password});
            }
        }

        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login(LoginDTO loginDTO)
        {
            AuthToken? tokens = await _authService.GetUserAsync(loginDTO);
            if (tokens == null)
            {
                return Unauthorized("Invalid username or password.");
            }


            return Ok(tokens);
        }
        [HttpPost]
        [Route("refresh-token/refresh")]
        public async Task<IActionResult> RefreshRefreshToken(RefreshTokenRequest refreshToken)
        {
            AuthToken? newRefreshToken = await _authService.VerifyTokenAsync(refreshToken.RefreshToken);
            if(newRefreshToken == null)
            {
                return Unauthorized();
            }
            else
            {
                return Ok(newRefreshToken);
            }
        }
    }
}
