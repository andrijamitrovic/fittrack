using FitTrack.Application.Interfaces;
using FitTrack.Application.Services;
using FitTrack.EFInfrastructure;
using FitTrack.EFInfrastructure.Identity;
using FitTrack.EFInfrastructure.Repositories;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddEFInfrastructure(builder.Configuration);
    
// Add services to the container.
builder.Services.AddScoped<IExerciseRepository, EfExerciseRepository>();
builder.Services.AddScoped<ExerciseService>();
builder.Services.AddScoped<IWorkoutRepository, EfWorkoutRepository>();
builder.Services.AddScoped<WorkoutService>();
builder.Services.AddControllers();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});


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

app.UseForwardedHeaders();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();


app.Run();
