using FitTrack.Application.Common;
using FitTrack.Application.DTOs;
using FitTrack.Application.Services;
using Microsoft.AspNetCore.Authorization;
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

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDTO registerDTO)
        {
            var result = await _authService.RegisterAsync(registerDTO);

            if (result.Code == ResultType.Conflict)
            {
                return Conflict(new { message = result.Message });
            }

            if (result.Code == ResultType.Failure)
            {
                return Problem(detail: result.Message);
            }

            return Ok(result.Data);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO loginDTO)
        {
            var result = await _authService.LoginAsync(loginDTO);

            if (result.Code == ResultType.Unauthorized)
            {
                return Unauthorized(new { message = result.Message });
            }

            if (result.Code == ResultType.Failure)
            {
                return Problem(detail: result.Message);
            }

            return Ok(result.Data);
        }

        [HttpPost("refresh-token/refresh")]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequest refreshToken)
        {
            var result = await _authService.RefreshTokenAsync(refreshToken.RefreshToken);

            if (result.Code == ResultType.Unauthorized)
            {
                return Unauthorized(new { message = result.Message });
            }

            if (result.Code == ResultType.Failure)
            {
                return Problem(detail: result.Message);
            }

            return Ok(result.Data);
        }

        [Authorize(Roles = "admin")]
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var result = await _authService.GetUsersAsync();
            return Ok(result.Data);
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var result = await _authService.DeleteUserAsync(id);

            if (result.Code == ResultType.NotFound)
            {
                return NotFound(new { message = result.Message });
            }

            if (result.Code == ResultType.Failure)
            {
                return Problem(detail: result.Message);
            }

            return NoContent();
        }
    }
}
