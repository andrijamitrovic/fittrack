using FitTrack.Application.DTOs;
using FitTrack.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace FitTrack.Api.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class WorkoutController : ControllerBase
    {
        private readonly WorkoutService _workoutService;

        public WorkoutController(WorkoutService workoutService)
        {
            _workoutService = workoutService;
        }

        [HttpPost]
        public async Task<ActionResult> Workout(WorkoutDTO workoutDTO)
        {
            var workout = await _workoutService.CreateWorkoutAsync(workoutDTO);
            return StatusCode(201, workout);
        }
    }
}
