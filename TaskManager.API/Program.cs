using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Middlewares;
using TaskManager.Application.Interfaces;
using TaskManager.Application.Services;
using TaskManager.Domain.Interfaces;
using TaskManager.Infrastructure.Data;
using TaskManager.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

builder.Services.AddMemoryCache();

builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<IIdempotencyRepository, IdempotencyRepository>();
builder.Services.AddScoped<ITaskService, TaskService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseMiddleware<IdempotencyMiddleware>();

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
