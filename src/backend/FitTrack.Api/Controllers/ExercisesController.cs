using System.Security.Claims;
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
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }
            
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

        [Authorize(Roles = "admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateExercise(Guid id,ExerciseDTO exercise)
        {
            if (GetUserId(User) is not Guid userId)
            {
                return Unauthorized();
            }

            var updatedExercise = await _exerciseService.UpdateExerciseAsync(exercise, id, userId);
            if (updatedExercise == null)
            {
                return BadRequest("Unable to update exercise");
            }
            return Ok(updatedExercise);
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteExercise(Guid id)
        {
            var deleted = await _exerciseService.DeleteExerciseAsync(id);
            if (!deleted)
            {
                return Conflict(new { Message = "Exercise is used in a workout." });
            }
            return NoContent();
        }

        private Guid? GetUserId(ClaimsPrincipal principal)
        {
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return null;
            return Guid.Parse(userIdClaim.Value);
        }
    }
}
