using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<TaskSummaryDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] TaskStatus? status = null,
        [FromQuery] string? titleContains = null,
        [FromQuery] string? descriptionContains = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] DateTime? completedDateFrom = null,
        [FromQuery] DateTime? completedDateTo = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDesc = false,
        [FromQuery] bool showDeleted = false)
    {
        var result = await _taskService.GetAllAsync(
            page, pageSize, status,
            titleContains, descriptionContains,
            dateFrom, dateTo,
            completedDateFrom, completedDateTo,
            sortBy, sortDesc, showDeleted);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskDetailDto>> GetById(int id)
    {
        var task = await _taskService.GetByIdAsync(id);

        if (task is null)
            return NotFound();

        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskDetailDto>> Create([FromBody] CreateTaskDto dto)
    {
        var created = await _taskService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskDetailDto>> Update(int id, [FromBody] UpdateTaskDto dto)
    {
        var updated = await _taskService.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<TaskDetailDto>> UpdateStatus(int id, [FromBody] UpdateTaskStatusDto dto)
    {
        var updated = await _taskService.UpdateStatusAsync(id, dto);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _taskService.DeleteAsync(id);
        return NoContent();
    }

    [HttpDelete("{id:int}/soft")]
    public async Task<IActionResult> SoftDelete(int id)
    {
        await _taskService.SoftDeleteAsync(id);
        return NoContent();
    }

    [HttpPatch("{id:int}/restore")]
    public async Task<IActionResult> Restore(int id)
    {
        await _taskService.RestoreAsync(id);
        return NoContent();
    }
}
