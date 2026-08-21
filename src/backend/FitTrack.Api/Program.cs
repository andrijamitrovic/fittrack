using FitTrack.Application.Interfaces;
using FitTrack.Application.Services;
using FitTrack.EFInfrastructure;
using FitTrack.EFInfrastructure.Identity;
using FitTrack.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);


var connectionString = builder.Configuration.GetConnectionString("PGConnectionString")!;

builder.Services.AddEFInfrastructure(builder.Configuration);
    
// Add services to the container.
builder.Services.AddScoped<IExerciseRepository>(provider => new ExerciseRepository(connectionString));
builder.Services.AddScoped<ExerciseService>();
builder.Services.AddScoped<IWorkoutRepository>(provider => new WorkoutRepository(connectionString));
builder.Services.AddScoped<WorkoutService>();
builder.Services.AddControllers();


builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
                      {
                          policy.AllowAnyOrigin()
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});


var app = builder.Build();

await IdentitySeeder.SeedIdentityAsync(app.Services);

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();


app.Run();
