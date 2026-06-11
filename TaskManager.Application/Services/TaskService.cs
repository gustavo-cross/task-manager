using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IMemoryCache _cache;

    private const string ListTokenKey = "tasks:list:token";
    private static readonly TimeSpan ListCacheDuration = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan ItemCacheDuration = TimeSpan.FromMinutes(10);

    public TaskService(ITaskRepository taskRepository, IMemoryCache cache)
    {
        _taskRepository = taskRepository;
        _cache = cache;
    }

    public async Task<PagedResultDto<TaskSummaryDto>> GetAllAsync(
        int page, int pageSize, TaskStatus? status,
        string? titleContains, string? descriptionContains,
        DateTime? dateFrom, DateTime? dateTo,
        DateTime? completedDateFrom, DateTime? completedDateTo,
        string? sortBy, bool sortDesc, bool showDeleted)
    {
        var cacheKey = BuildListCacheKey(page, pageSize, status, titleContains, descriptionContains, dateFrom, dateTo, completedDateFrom, completedDateTo, sortBy, sortDesc, showDeleted);

        if (_cache.TryGetValue(cacheKey, out PagedResultDto<TaskSummaryDto>? cached) && cached is not null)
            return cached;

        var (items, totalCount) = await _taskRepository.GetAllAsync(
            page, pageSize, status,
            titleContains, descriptionContains,
            dateFrom, dateTo,
            completedDateFrom, completedDateTo,
            sortBy, sortDesc, showDeleted);

        var result = new PagedResultDto<TaskSummaryDto>
        {
            Items = items.Select(MapToSummaryDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };

        var options = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(ListCacheDuration)
            .AddExpirationToken(new CancellationChangeToken(GetOrCreateListToken().Token));

        _cache.Set(cacheKey, result, options);
        return result;
    }

    public async Task<TaskDetailDto?> GetByIdAsync(int id)
    {
        var cacheKey = $"task:{id}";

        if (_cache.TryGetValue(cacheKey, out TaskDetailDto? cached))
            return cached;

        var task = await _taskRepository.GetByIdAsync(id);
        var dto = task is null ? null : MapToDetailDto(task);

        if (dto is not null)
            _cache.Set(cacheKey, dto, ItemCacheDuration);

        return dto;
    }

    public async Task<TaskDetailDto> CreateAsync(CreateTaskDto dto)
    {
        ValidateTitle(dto.Title);

        var createdAt = DateTime.UtcNow;

        if (dto.CompletedAt.HasValue && dto.CompletedAt.Value < createdAt)
            throw new ArgumentException("A data de conclusão não pode ser anterior à data de criação.");

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            CreatedAt = createdAt,
            CompletedAt = dto.CompletedAt,
            Status = TaskStatus.Pending
        };

        var created = await _taskRepository.CreateAsync(task);
        InvalidateListCache();
        return MapToDetailDto(created);
    }

    public async Task<TaskDetailDto> UpdateAsync(int id, UpdateTaskDto dto)
    {
        var task = await _taskRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Tarefa com id {id} não encontrada.");

        ValidateTitle(dto.Title);

        if (dto.CompletedAt.HasValue && dto.CompletedAt.Value < task.CreatedAt)
            throw new ArgumentException("A data de conclusão não pode ser anterior à data de criação.");

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.CompletedAt = dto.CompletedAt;
        task.Status = dto.Status;

        var updated = await _taskRepository.UpdateAsync(task);

        _cache.Remove($"task:{id}");
        InvalidateListCache();

        return MapToDetailDto(updated);
    }

    public async Task<TaskDetailDto> UpdateStatusAsync(int id, UpdateTaskStatusDto dto)
    {
        var task = await _taskRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Tarefa com id {id} não encontrada.");

        task.Status = dto.Status;

        var updated = await _taskRepository.UpdateAsync(task);

        _cache.Remove($"task:{id}");
        InvalidateListCache();

        return MapToDetailDto(updated);
    }

    public async Task DeleteAsync(int id)
    {
        var task = await _taskRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Tarefa com id {id} não encontrada.");

        await _taskRepository.DeleteAsync(task.Id);

        _cache.Remove($"task:{id}");
        InvalidateListCache();
    }

    public async Task SoftDeleteAsync(int id)
    {
        var task = await _taskRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Tarefa com id {id} não encontrada.");

        await _taskRepository.SoftDeleteAsync(task.Id);

        _cache.Remove($"task:{id}");
        InvalidateListCache();
    }

    public async Task RestoreAsync(int id)
    {
        var task = await _taskRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Tarefa com id {id} não encontrada.");

        await _taskRepository.RestoreAsync(task.Id);

        _cache.Remove($"task:{id}");
        InvalidateListCache();
    }

    // Retrieves or creates a shared CancellationTokenSource stored in the cache.
    // All list cache entries register this token, so a single Cancel() evicts them all.
    private CancellationTokenSource GetOrCreateListToken()
    {
        return _cache.GetOrCreate(ListTokenKey, entry =>
        {
            entry.Priority = CacheItemPriority.NeverRemove;
            return new CancellationTokenSource();
        })!;
    }

    private void InvalidateListCache()
    {
        if (_cache.TryGetValue<CancellationTokenSource>(ListTokenKey, out var cts))
        {
            _cache.Remove(ListTokenKey);
            cts!.Cancel();
            cts.Dispose();
        }
    }

    private static string BuildListCacheKey(
        int page, int pageSize, TaskStatus? status,
        string? titleContains, string? descriptionContains,
        DateTime? dateFrom, DateTime? dateTo,
        DateTime? completedDateFrom, DateTime? completedDateTo,
        string? sortBy, bool sortDesc, bool showDeleted) =>
        $"tasks:list:{page}:{pageSize}:{status}:{titleContains}:{descriptionContains}:{dateFrom:yyyyMMdd}:{dateTo:yyyyMMdd}:{completedDateFrom:yyyyMMdd}:{completedDateTo:yyyyMMdd}:{sortBy}:{sortDesc}:{showDeleted}";

    private static void ValidateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("O título é obrigatório.");

        if (title.Length > 100)
            throw new ArgumentException("O título deve ter no máximo 100 caracteres.");
    }

    private static TaskSummaryDto MapToSummaryDto(TaskItem task) => new()
    {
        Id = task.Id,
        Title = task.Title,
        Status = task.Status,
        CreatedAt = task.CreatedAt,
        CompletedAt = task.CompletedAt,
        IsDeleted = task.IsDeleted
    };

    private static TaskDetailDto MapToDetailDto(TaskItem task) => new()
    {
        Id = task.Id,
        Title = task.Title,
        Description = task.Description,
        Status = task.Status,
        CreatedAt = task.CreatedAt,
        CompletedAt = task.CompletedAt,
        IsDeleted = task.IsDeleted
    };
}
