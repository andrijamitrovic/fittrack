using FitTrack.Application.DTOs;
using FitTrack.Application.Services;
using FitTrack.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitTrack.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExercisesController : ControllerBase
    {
        private readonly ExerciseService _exerciseService;

        public ExercisesController(ExerciseService exerciseService)
        {
            _exerciseService = exerciseService;
        }

        [HttpGet]
        public async Task<ActionResult> GetExercises()
        {
            var exercises = await _exerciseService.GetAllAsync();
            return Ok(exercises);
        }

        [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<ActionResult> AddExercise(ExerciseDTO exercise)
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var createdExercise = await _exerciseService.AddExercise(exercise, userId);
            if (createdExercise == null)
            {
                return BadRequest("Unable to add exercise");
            }
            return CreatedAtAction(nameof(GetExercise), new { id = createdExercise.Id }, createdExercise);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetExercise(Guid id)
        {
            var exercise = await _exerciseService.GetExerciseAsync(id);
            if (exercise == null) return NotFound();
            return Ok(exercise);
        }
    }
}
