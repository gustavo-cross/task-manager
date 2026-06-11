import axios from 'axios';
import { useEffect, useState } from 'react';
import { createTask, getTaskById, updateTask } from '../services/taskService';
import type { TaskStatus } from '../types/task';

interface TaskFormProps {
  taskId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TaskForm({ taskId, onSuccess, onCancel }: TaskFormProps) {
  const isEdit = taskId !== undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completedAt, setCompletedAt] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [titleError, setTitleError] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    getTaskById(taskId)
      .then((task) => {
        setTitle(task.title);
        setDescription(task.description ?? '');
        setCompletedAt(task.completedAt ? task.completedAt.substring(0, 10) : '');
        setStatus(task.status);
      })
      .catch(() => setFeedback({ type: 'error', message: 'Erro ao carregar tarefa.' }));
  }, [isEdit, taskId]);

  const validate = (): boolean => {
    if (!title.trim()) {
      setTitleError('O título é obrigatório.');
      return false;
    }
    if (title.length > 100) {
      setTitleError('O título deve ter no máximo 100 caracteres.');
      return false;
    }
    setTitleError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFeedback(null);

    try {
      if (isEdit) {
        await updateTask(taskId, {
          title,
          description: description || undefined,
          status,
          completedAt: completedAt || undefined,
        });
      } else {
        await createTask({
          title,
          description: description || undefined,
          completedAt: completedAt || undefined,
        });
      }
      setFeedback({
        type: 'success',
        message: isEdit ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!',
      });
      setTimeout(onSuccess, 700);
    } catch (err) {
      const apiMessage =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Erro ao salvar tarefa. Tente novamente.';
      setFeedback({ type: 'error', message: apiMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Title */}
      <div className="form-field">
        <label className="form-label">Título *</label>
        <input
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Digite o título da tarefa"
          autoFocus
        />
        {titleError && <span className="form-error">{titleError}</span>}
      </div>

      {/* Description */}
      <div className="form-field">
        <label className="form-label">
          Descrição <span className="form-label-optional">(opcional)</span>
        </label>
        <textarea
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Descreva a tarefa..."
        />
      </div>

      {/* Completion Date */}
      <div className="form-field">
        <label className="form-label">
          Data de Conclusão <span className="form-label-optional">(opcional)</span>
        </label>
        <input
          type="date"
          className="form-input"
          value={completedAt}
          min={new Date().toISOString().substring(0, 10)}
          onChange={(e) => setCompletedAt(e.target.value)}
        />
      </div>

      {/* Status — edit only */}
      {isEdit && (
        <div className="form-field">
          <label className="form-label">Status</label>
          <div className="select-wrapper">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              <option value="Pending">Pendente</option>
              <option value="InProgress">Em Progresso</option>
              <option value="Completed">Concluída</option>
            </select>
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`form-feedback form-feedback-${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {/* Actions */}
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
        </button>
      </div>
    </form>
  );
}
