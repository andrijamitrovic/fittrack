using FitTrack.Application.DTOs;
using FitTrack.Application.Services;
using FitTrack.EFInfrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FitTrack.Api.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class WorkoutsController : ControllerBase
    {
        private readonly WorkoutService _workoutService;
        private readonly UserManager<ApplicationUser> _userManager;

        public WorkoutsController(WorkoutService workoutService, UserManager<ApplicationUser> userManager)
        {
            _workoutService = workoutService;
            _userManager = userManager;
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult> SetWorkout(WorkoutDTO workoutDTO)
        {
            var userId = await GetCurrentUserIdAsync();

            if (userId is null)
            {
                return Unauthorized();
            }

            var result = await _workoutService.CreateWorkoutAsync(workoutDTO, userId.Value, false);
            if (result.Code == Application.Common.ResultType.Failure)
            {
                return BadRequest(new { message = result.Message });
            }
            return CreatedAtAction(nameof(GetWorkout), new { id = result.Data!.Id }, result.Data);
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult> GetWorkouts()
        {
            var userId = await GetCurrentUserIdAsync();

            if (userId is null)
            {
                return Unauthorized();
            }

            var result = await _workoutService.GetWorkoutsAsync(userId.Value, false);
            return Ok(result.Data);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult> GetWorkout(Guid id)
        {
            var userId = await GetCurrentUserIdAsync();

            if (userId is null)
            {
                return Unauthorized();
            }

            var result = await _workoutService.GetWorkoutAsync(userId.Value, id);
            if (result.Code == Application.Common.ResultType.NotFound)
            {
                return NotFound(new { message = "Workout not found." });
            }
            return Ok(result.Data);
        }

        // [Authorize]
        // [HttpGet("workout-templates/{id}")]
        // public async Task<ActionResult> GetTemplate(Guid id)
        // {
        //     if (GetUserId(User) is not Guid userId)
        //     {
        //         return Unauthorized();
        //     }

        //     var result = await _workoutService.GetWorkoutAsync(userId, id, true);
        //     if (result.Code == Application.Common.ResultType.NotFound)
        //     {
        //         return NotFound(new { message = "Workout not found." });
        //     }
        //     return Ok(result.Data);
        // }

        [Authorize]
        [HttpPost("workout-templates")]
        public async Task<ActionResult> SetWorkoutTemplate(WorkoutDTO workoutDTO)
        {
            var userId = await GetCurrentUserIdAsync();

            if (userId is null)
            {
                return Unauthorized();
            }

            var result = await _workoutService.CreateWorkoutAsync(workoutDTO, userId.Value, true);
            if (result.Code == Application.Common.ResultType.Failure) return BadRequest(new { message = result.Message });
            return StatusCode(201, result.Data);
        }

        [Authorize]
        [HttpGet("workout-templates")]
        public async Task<ActionResult> GetWorkoutTemplates()
        {
            var userId = await GetCurrentUserIdAsync();

            if (userId is null)
            {
                return Unauthorized();
            }

            var result = await _workoutService.GetWorkoutsAsync(userId.Value, true);
            return Ok(result.Data);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateWorkout(WorkoutDTO workoutDTO, Guid id)
        {
            var userId = await GetCurrentUserIdAsync();

            if (userId is null)
            {
                return Unauthorized();
            }

            var result = await _workoutService.UpdateWorkoutAsync(userId.Value, id, workoutDTO, false);

            if (result.Code == Application.Common.ResultType.NotFound)
            {
                return NotFound(new { message = result.Message });
            }
            else if (result.Code == Application.Common.ResultType.Conflict)
            {
                return Conflict(new { message = result.Message });
            }
            else if (result.Code == Application.Common.ResultType.Failure)
            {
                return Problem(result.Message);
            }
            else
            {
                return Ok(result.Data);
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteWorkout(Guid id)
        {
            var userId = await GetCurrentUserIdAsync();

            if (userId is null)
            {
                return Unauthorized();
            }

            var result = await _workoutService.DeleteWorkoutAsync(userId.Value, id, false);

            if (result.Code == Application.Common.ResultType.NotFound)
            {
                return NotFound(new { message = result.Message });
            }
            else if (result.Code == Application.Common.ResultType.Conflict)
            {
                return Conflict(new { message = result.Message });
            }
            else if (result.Code == Application.Common.ResultType.Failure)
            {
                return Problem(result.Message);
            }
            else
            {
                return NoContent();
            }

        }

        [Authorize]
        [HttpPut("workout-templates/{id}")]
        public async Task<ActionResult> UpdateTemplate(WorkoutDTO workoutDTO, Guid id)
        {
            var userId = await GetCurrentUserIdAsync();

            if (userId is null)
            {
                return Unauthorized();
            }

            var result = await _workoutService.UpdateWorkoutAsync(userId.Value, id, workoutDTO, true);

            if (result.Code == Application.Common.ResultType.NotFound)
            {
                return NotFound(new { message = result.Message });
            }
            else if (result.Code == Application.Common.ResultType.Failure)
            {
                return Problem(result.Message);
            }
            else
            {
                return Ok(result.Data);
            }
        }

        [Authorize]
        [HttpDelete("workout-templates/{id}")]
        public async Task<ActionResult> DeleteTemplate(Guid id)
        {
            var userId = await GetCurrentUserIdAsync();

            if (userId is null)
            {
                return Unauthorized();
            }

            var result = await _workoutService.DeleteWorkoutAsync(userId.Value, id, true);

            if (result.Code == Application.Common.ResultType.NotFound)
            {
                return NotFound(new { message = result.Message });
            }
            else if (result.Code == Application.Common.ResultType.Failure)
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
