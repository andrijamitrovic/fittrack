namespace FitTrack.E2ETests;

public static class TestConfig
{
    public static string BaseUrl =>
        Environment.GetEnvironmentVariable("TEST_BASE_URL")
        ?? "http://localhost:5173";

    public static string ApiUrl =>
        Environment.GetEnvironmentVariable("TEST_API_URL")
        ?? "http://localhost:5212";

    public static string TestEmail =>
        Environment.GetEnvironmentVariable("TEST_EMAIL")
        ?? "test@test.com";

    public static string TestPassword =>
        Environment.GetEnvironmentVariable("TEST_PASSWORD")
        ?? "password";
}