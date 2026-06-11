using Microsoft.Extensions.Caching.Memory;
using Moq;
using TaskManager.Application.DTOs;
using TaskManager.Application.Services;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Tests;

public class TaskServiceTests
{
    private readonly Mock<ITaskRepository> _taskRepositoryMock;
    private readonly IMemoryCache _cache;
    private readonly TaskService _taskService;

    public TaskServiceTests()
    {
        _taskRepositoryMock = new Mock<ITaskRepository>();
        _cache = new MemoryCache(new MemoryCacheOptions());
        _taskService = new TaskService(_taskRepositoryMock.Object, _cache);
    }

    [Fact]
    public async Task CreateAsync_ComDadosValidos_CriaERetornaDto()
    {
        var dto = new CreateTaskDto { Title = "Minha tarefa", Description = "Descrição" };

        _taskRepositoryMock
            .Setup(r => r.CreateAsync(It.IsAny<TaskItem>()))
            .ReturnsAsync((TaskItem t) => { t.Id = 1; return t; });

        var result = await _taskService.CreateAsync(dto);

        Assert.Equal(1, result.Id);
        Assert.Equal("Minha tarefa", result.Title);
        Assert.Equal("Descrição", result.Description);
        Assert.Equal(TaskStatus.Pending, result.Status);
        _taskRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<TaskItem>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ComTituloVazio_LancaArgumentException()
    {
        var dto = new CreateTaskDto { Title = "" };

        await Assert.ThrowsAsync<ArgumentException>(() => _taskService.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_ComTituloAcimaDe100Chars_LancaArgumentException()
    {
        var dto = new CreateTaskDto { Title = new string('A', 101) };

        await Assert.ThrowsAsync<ArgumentException>(() => _taskService.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_ComCompletedAtAnteriorACreatedAt_LancaArgumentException()
    {
        var dto = new CreateTaskDto
        {
            Title = "Tarefa válida",
            CompletedAt = DateTime.UtcNow.AddDays(-1)
        };

        var ex = await Assert.ThrowsAsync<ArgumentException>(() => _taskService.CreateAsync(dto));
        Assert.Contains("data de conclusão", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task UpdateAsync_ComTarefaExistente_AtualizaERetornaDto()
    {
        var existingTask = new TaskItem
        {
            Id = 1,
            Title = "Antiga",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            Status = TaskStatus.Pending
        };

        var dto = new UpdateTaskDto
        {
            Title = "Nova",
            Description = "Nova descrição",
            Status = TaskStatus.InProgress
        };

        _taskRepositoryMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(existingTask);

        _taskRepositoryMock
            .Setup(r => r.UpdateAsync(It.IsAny<TaskItem>()))
            .ReturnsAsync((TaskItem t) => t);

        var result = await _taskService.UpdateAsync(1, dto);

        Assert.Equal("Nova", result.Title);
        Assert.Equal("Nova descrição", result.Description);
        Assert.Equal(TaskStatus.InProgress, result.Status);
        _taskRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<TaskItem>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ComTarefaInexistente_LancaKeyNotFoundException()
    {
        _taskRepositoryMock
            .Setup(r => r.GetByIdAsync(99))
            .ReturnsAsync((TaskItem?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _taskService.UpdateAsync(99, new UpdateTaskDto { Title = "Título" }));
    }

    [Fact]
    public async Task DeleteAsync_ComTarefaInexistente_LancaKeyNotFoundException()
    {
        _taskRepositoryMock
            .Setup(r => r.GetByIdAsync(99))
            .ReturnsAsync((TaskItem?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _taskService.DeleteAsync(99));
    }

    [Fact]
    public async Task GetByIdAsync_SegundaChamada_RetornaCacheadoSemHitarRepositorio()
    {
        var task = new TaskItem { Id = 5, Title = "Cache test", CreatedAt = DateTime.UtcNow, Status = TaskStatus.Pending };

        _taskRepositoryMock
            .Setup(r => r.GetByIdAsync(5))
            .ReturnsAsync(task);

        await _taskService.GetByIdAsync(5);
        await _taskService.GetByIdAsync(5);

        _taskRepositoryMock.Verify(r => r.GetByIdAsync(5), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_InvalidaCacheDeItem()
    {
        var task = new TaskItem { Id = 3, Title = "Original", CreatedAt = DateTime.UtcNow.AddDays(-1), Status = TaskStatus.Pending };

        _taskRepositoryMock.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(task);
        _taskRepositoryMock.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>())).ReturnsAsync((TaskItem t) => t);

        await _taskService.GetByIdAsync(3);

        var dto = new UpdateTaskDto { Title = "Atualizado", Status = TaskStatus.InProgress };
        await _taskService.UpdateAsync(3, dto);

        await _taskService.GetByIdAsync(3);

        // After invalidation GetByIdAsync must hit the repository again (2nd call after update)
        _taskRepositoryMock.Verify(r => r.GetByIdAsync(3), Times.Exactly(3));
    }
}
