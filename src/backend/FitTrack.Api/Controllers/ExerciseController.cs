using FitTrack.Application.DTOs;
using FitTrack.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace FitTrack.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExerciseController : ControllerBase
    {
        private readonly ExerciseService _exerciseService;

        public ExerciseController(ExerciseService exerciseService)
        {
            _exerciseService = exerciseService;
        }

        [HttpGet]
        public async Task<ActionResult> Exercises()
        {
            var exercises = await _exerciseService.GetAllAsync();
            return Ok(exercises);
        }
    }
}
