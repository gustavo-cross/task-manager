using System.ComponentModel.DataAnnotations;

namespace TaskManager.Application.DTOs;

public class UpdateTaskDto
{
    [Required(ErrorMessage = "O título é obrigatório.")]
    [MaxLength(100, ErrorMessage = "O título deve ter no máximo 100 caracteres.")]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime? CompletedAt { get; set; }

    public TaskStatus Status { get; set; }
}
