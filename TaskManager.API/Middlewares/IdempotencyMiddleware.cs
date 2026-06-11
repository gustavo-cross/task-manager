using System.Text;
using System.Text.Json;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.API.Middlewares;

public class IdempotencyMiddleware
{
    private readonly RequestDelegate _next;

    public IdempotencyMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IIdempotencyRepository idempotencyRepository)
    {
        if (!HttpMethods.IsPost(context.Request.Method) && !HttpMethods.IsPut(context.Request.Method))
        {
            await _next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue("Idempotency-Key", out var keyValues) || string.IsNullOrWhiteSpace(keyValues))
        {
            await WriteErrorAsync(context, StatusCodes.Status400BadRequest, "Header 'Idempotency-Key' é obrigatório.");
            return;
        }

        var key = keyValues.ToString();

        if (!Guid.TryParse(key, out _))
        {
            await WriteErrorAsync(context, StatusCodes.Status400BadRequest, "O valor do header 'Idempotency-Key' deve ser um UUID válido.");
            return;
        }

        var existing = await idempotencyRepository.GetByKeyAsync(key);
        if (existing is not null)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = existing.StatusCode;
            await context.Response.WriteAsync(existing.Response);
            return;
        }

        var originalBody = context.Response.Body;
        using var memoryStream = new MemoryStream();
        context.Response.Body = memoryStream;

        try
        {
            await _next(context);

            memoryStream.Seek(0, SeekOrigin.Begin);
            var responseBody = await new StreamReader(memoryStream).ReadToEndAsync();

            var record = new IdempotencyRecord
            {
                Key = key,
                Response = responseBody,
                StatusCode = context.Response.StatusCode,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };

            await idempotencyRepository.SaveAsync(record);

            memoryStream.Seek(0, SeekOrigin.Begin);
            await memoryStream.CopyToAsync(originalBody);
        }
        finally
        {
            context.Response.Body = originalBody;
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, int statusCode, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var response = new
        {
            statusCode,
            message,
            errors = Array.Empty<string>()
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
