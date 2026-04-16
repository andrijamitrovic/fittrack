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

            var workout = await _workoutService.CreateWorkoutAsync(workoutDTO, userId, false);
            return StatusCode(201, workout);
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult> GetWorkouts()
        {
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var workouts = await _workoutService.GetWorkoutsAsync(userId, false);
            return Ok(workouts);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult> GetWorkout(Guid id)
        {
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var workouts = await _workoutService.GetWorkoutsAsync(userId, false, id);
            if (!workouts.Any())
            {
                return NotFound(new { message = "Workout not found." });
            }
            return Ok(workouts.First());
        }

        [Authorize]
        [HttpPost("workout-templates")]
        public async Task<ActionResult> SetWorkoutTemplate(WorkoutDTO workoutDTO)
        {
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var workout = await _workoutService.CreateWorkoutAsync(workoutDTO, userId, true);
            return StatusCode(201, workout);
        }

        [Authorize]
        [HttpGet("workout-templates")]
        public async Task<ActionResult> GetWorkoutTemplates()
        {
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var workoutTemplates = await _workoutService.GetWorkoutsAsync(userId, true);
            return Ok(workoutTemplates);
        }

        [Authorize]
        [HttpPost("from-workout/{workoutId}/as-template")]
        public async Task<ActionResult> MakeTemplateFromWorkout(Guid workoutId)
        {
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var workout = await _workoutService.CopyWorkout(userId, true, workoutId);
            if (workout == null) return NotFound(new { message = "Workout not found." });
            return StatusCode(201, workout);
        }

        [Authorize]
        [HttpPost("from-workout/{workoutId}/as-workout")]
        public async Task<ActionResult> RepeatWorkout(Guid workoutId)
        {
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var workout = await _workoutService.CopyWorkout(userId, false, workoutId);
            if (workout == null) return NotFound(new { message = "Workout not found." });
            return StatusCode(201, workout);
        }

        private Guid? GetUserId(ClaimsPrincipal principal)
        {
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return null;
            return Guid.Parse(userIdClaim.Value);
        }
    }
}
