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
            if(result.Code == Application.Common.ResultType.Failure)
            {
                return BadRequest(new { message = result.Message });
            }
            return CreatedAtAction(nameof(GetWorkout), new {id = result.Data!.Id}, result.Data);
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

            var result = await _workoutService.GetWorkoutAsync(userId, id);
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

        private Guid? GetUserId(ClaimsPrincipal principal)
        {
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return null;
            return Guid.Parse(userIdClaim.Value);
        }
    }
}
