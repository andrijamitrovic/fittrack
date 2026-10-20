using FitTrack.Application.Common;
using FitTrack.Application.DTOs;
using FitTrack.Application.Services;
using FitTrack.EFInfrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FitTrack.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExercisesController : ControllerBase
    {
        private readonly ExerciseService _exerciseService;
        private readonly UserManager<ApplicationUser> _userManager;

        public ExercisesController(ExerciseService exerciseService, UserManager<ApplicationUser> userManager)
        {
            _exerciseService = exerciseService;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult> GetExercises()
        {
            var result = await _exerciseService.GetAllAsync();
            return Ok(result.Data);
        }

        [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<ActionResult> AddExercise(ExerciseDTO exercise)
        {
            var userId = await GetCurrentUserIdAsync();

            if (userId is null)
            {
                return Unauthorized();
            }

            var result = await _exerciseService.AddExerciseAsync(exercise, userId.Value);
            if (result.Code == ResultType.Conflict)
            {
                return Conflict(new { message = result.Message });
            }
            else if (result.Code == ResultType.Failure)
            {
                return Problem(result.Message);
            }
            else
            {
                return CreatedAtAction(nameof(GetExercise), new { id = result.Data!.Id }, result.Data);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetExercise(Guid id)
        {
            var result = await _exerciseService.GetExerciseAsync(id);
            if (result.Code == ResultType.NotFound) return NotFound();
            return Ok(result.Data);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateExercise(Guid id, ExerciseDTO exercise)
        {
            var userId = await GetCurrentUserIdAsync();

            if (userId is null)
            {
                return Unauthorized();
            }

            var result = await _exerciseService.UpdateExerciseAsync(exercise, id, userId.Value);
            if (result.Code == ResultType.NotFound)
            {
                return NotFound(new { message = result.Message });
            }
            else if (result.Code == ResultType.Conflict)
            {
                return Conflict(new { message = result.Message });
            }
            else if (result.Code == ResultType.Failure)
            {
                return Problem(result.Message);
            }
            else
            {
                return Ok(result.Data);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteExercise(Guid id)
        {
            var result = await _exerciseService.DeleteExerciseAsync(id);

            if (result.Code == ResultType.NotFound)
            {
                return NotFound(new { message = result.Message });
            }
            else if (result.Code == ResultType.Conflict)
            {
                return Conflict(new { message = result.Message });
            }
            else if (result.Code == ResultType.Failure)
            {
                return Problem(result.Message);
            }
            else
            {
                return NoContent();
            }
        }

        private async Task<Guid?> GetCurrentUserIdAsync()
        {
            var user = await _userManager.GetUserAsync(User);
            return user?.Id;
        }
    }
}
