using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Interfaces;

public interface ITaskRepository
{
    Task<(IEnumerable<TaskItem> Items, int TotalCount)> GetAllAsync(
        int page, int pageSize, TaskStatus? status,
        string? titleContains, string? descriptionContains,
        DateTime? dateFrom, DateTime? dateTo,
        DateTime? completedDateFrom, DateTime? completedDateTo,
        string? sortBy, bool sortDesc, bool showDeleted);
    Task<TaskItem?> GetByIdAsync(int id);
    Task<TaskItem> CreateAsync(TaskItem task);
    Task<TaskItem> UpdateAsync(TaskItem task);
    Task DeleteAsync(int id);
    Task SoftDeleteAsync(int id);
    Task RestoreAsync(int id);
}
