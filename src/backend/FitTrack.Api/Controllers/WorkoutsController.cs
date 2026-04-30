using System.Security.Claims;
using FitTrack.Application.DTOs;
using FitTrack.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitTrack.Api.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class WorkoutsController : ControllerBase
    {
        private readonly WorkoutService _workoutService;

        public WorkoutsController(WorkoutService workoutService)
        {
            _workoutService = workoutService;
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult> SetWorkout(WorkoutDTO workoutDTO)
        {
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var result = await _workoutService.CreateWorkoutAsync(workoutDTO, userId, false);
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
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var result = await _workoutService.GetWorkoutsAsync(userId, false);
            return Ok(result.Data);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult> GetWorkout(Guid id)
        {
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var result = await _workoutService.GetWorkoutAsync(userId, id, false);
            if (result.Code == Application.Common.ResultType.NotFound)
            {
                return NotFound(new { message = "Workout not found." });
            }
            return Ok(result.Data);
        }

        [Authorize]
        [HttpGet("workout-templates/{id}")]
        public async Task<ActionResult> GetTemplate(Guid id)
        {
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var result = await _workoutService.GetWorkoutAsync(userId, id, true);
            if (result.Code == Application.Common.ResultType.NotFound)
            {
                return NotFound(new { message = "Workout not found." });
            }
            return Ok(result.Data);
        }

        [Authorize]
        [HttpPost("workout-templates")]
        public async Task<ActionResult> SetWorkoutTemplate(WorkoutDTO workoutDTO)
        {
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var result = await _workoutService.CreateWorkoutAsync(workoutDTO, userId, true);
            if (result.Code == Application.Common.ResultType.Failure) return BadRequest(new { message = result.Message });
            return StatusCode(201, result.Data);
        }

        [Authorize]
        [HttpGet("workout-templates")]
        public async Task<ActionResult> GetWorkoutTemplates()
        {
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var result = await _workoutService.GetWorkoutsAsync(userId, true);
            return Ok(result.Data);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateWorkout(WorkoutDTO workoutDTO, Guid id)
        {
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var result = await _workoutService.UpdateWorkoutAsync(userId, id, workoutDTO, false);

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
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var result = await _workoutService.DeleteWorkoutAsync(userId, id, false);

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
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var result = await _workoutService.UpdateWorkoutAsync(userId, id, workoutDTO, true);

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
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var result = await _workoutService.DeleteWorkoutAsync(userId, id, true);

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

        private Guid? GetUserId(ClaimsPrincipal principal)
        {
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return null;
            return Guid.Parse(userIdClaim.Value);
        }
    }
}
