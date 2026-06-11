using TaskManager.Application.DTOs;

namespace TaskManager.Application.Interfaces;

public interface ITaskService
{
    Task<PagedResultDto<TaskSummaryDto>> GetAllAsync(
        int page, int pageSize, TaskStatus? status,
        string? titleContains, string? descriptionContains,
        DateTime? dateFrom, DateTime? dateTo,
        DateTime? completedDateFrom, DateTime? completedDateTo,
        string? sortBy, bool sortDesc, bool showDeleted);
    Task<TaskDetailDto?> GetByIdAsync(int id);
    Task<TaskDetailDto> CreateAsync(CreateTaskDto dto);
    Task<TaskDetailDto> UpdateAsync(int id, UpdateTaskDto dto);
    Task<TaskDetailDto> UpdateStatusAsync(int id, UpdateTaskStatusDto dto);
    Task DeleteAsync(int id);
    Task SoftDeleteAsync(int id);
    Task RestoreAsync(int id);
}
