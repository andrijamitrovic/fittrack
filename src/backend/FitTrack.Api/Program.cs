using FitTrack.Application.Interfaces;
using FitTrack.Application.Services;
using FitTrack.Infrastructure.Repositories;
using System.Data.Common;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("PGConnectionString")!;
// Add services to the container.
builder.Services.AddScoped<IExerciseRepository>(provider => new ExerciseRepository(connectionString));
builder.Services.AddScoped<ExerciseService>();
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
app.UseCors();
app.MapControllers();


app.UseHttpsRedirection();


app.Run();