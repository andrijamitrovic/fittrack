
using FitTrack.EFInfrastructure.Identity;
using FitTrack.EFInfrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FitTrack.EFInfrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddEFInfrastructure(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PGConnectionString")
            ?? throw new InvalidOperationException("Connection string was not found.");

        services.AddDbContext<FitTrackDbContext>(options => 
            options.UseNpgsql(connectionString));

        services
            .AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = false;
            })
            .AddEntityFrameworkStores<FitTrackDbContext>()
            .AddDefaultTokenProviders();

        services.ConfigureApplicationCookie(options =>
        {
            options.LoginPath = "/api/external-auth/google/login";
            options.LogoutPath = "/api/external-auth/logout";
            options.AccessDeniedPath = "/api/external-auth/access-denied";
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        });

        services.AddAuthentication()
            .AddGoogle(options =>
            {
                options.ClientId = configuration["Authentication:Google:ClientId"]
                    ?? throw new InvalidOperationException("Google ClientId was not configured.");

                options.ClientSecret = configuration["Authentication:Google:ClientSecret"]
                    ?? throw new InvalidOperationException("Google ClientSecret was not configured.");
            });

        return services;
    }
}