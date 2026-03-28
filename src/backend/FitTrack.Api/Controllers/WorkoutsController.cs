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
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var workout = await _workoutService.CreateWorkoutAsync(workoutDTO, userId, false);
            return StatusCode(201, workout);
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult> GetWorkouts()
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var workouts = await _workoutService.GetWorkoutsAsync(userId, false);
            return Ok(workouts);
        }

        [Authorize]
        [HttpPost("workout-templates")]
        public async Task<ActionResult> SetWorkoutTemplate(WorkoutDTO workoutDTO)
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var workout = await _workoutService.CreateWorkoutAsync(workoutDTO, userId, true);
            return StatusCode(201, workout);
        }

        [Authorize]
        [HttpGet("workout-templates")]
        public async Task<ActionResult> GetWorkoutTemplates()
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var workoutTemplates = await _workoutService.GetWorkoutsAsync(userId, true);
            return Ok(workoutTemplates);
        }

    }
}
