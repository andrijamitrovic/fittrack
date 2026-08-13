using System.Security.Claims;
using FitTrack.EFInfrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FitTrack.Api.Controllers;

[ApiController]
[Route("api/external-auth")]
public class ExternalAuthController : ControllerBase
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public ExternalAuthController(
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager)
    {
        _signInManager = signInManager;
        _userManager = userManager;
    }

    [HttpGet("google/login")]
    public IActionResult GoogleLogin([FromQuery] string? returnUrl = "/app")
    {
        var redirectUrl = Url.Action(nameof(GoogleCallback), "ExternalAuth", new { returnUrl });
        var properties = _signInManager.ConfigureExternalAuthenticationProperties("Google", redirectUrl);

        return Challenge(properties, "Google");
    }

    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback([FromQuery] string? returnUrl = "/app")
    {
        var info = await _signInManager.GetExternalLoginInfoAsync();

        if (info is null)
        {
            return Unauthorized(new { message = "External login information was not available." });
        }

        var signInResult = await _signInManager.ExternalLoginSignInAsync(
            info.LoginProvider,
            info.ProviderKey,
            isPersistent: true,
            bypassTwoFactor: true);

        if (signInResult.Succeeded)
        {
            return LocalRedirect(returnUrl ?? "/app");
        }

        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "Google account did not provide an email address." });
        }

        var displayName =
            info.Principal.FindFirstValue(ClaimTypes.Name)
            ?? email;

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            DisplayName = displayName
        };

        var createResult = await _userManager.CreateAsync(user);

        if (!createResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "User could not be created.",
                errors = createResult.Errors.Select(error => error.Description)
            });
        }

        var loginResult = await _userManager.AddLoginAsync(user, info);


        if (!loginResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "External login could not be linked.",
                errors = loginResult.Errors.Select(error => error.Description)
            });
        }

        var roleResult = await _userManager.AddToRoleAsync(user, "user");

        if(!roleResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "Default role could not be assigned.",
                errors = roleResult.Errors.Select(error => error.Description)
            });
        }

        await _signInManager.SignInAsync(user, isPersistent: true);

        return LocalRedirect(returnUrl ?? "/app");
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var user = await _userManager.GetUserAsync(User);

        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            displayName = user.DisplayName   
        });
    }

    [HttpGet("access-denied")]
    public IActionResult AccessDenied()
    {
        return Forbid();
    }
}