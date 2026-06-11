import axios from 'axios';
import type {
  CreateTaskPayload,
  PagedResult,
  TaskDetail,
  TaskFilters,
  TaskStatus,
  TaskSummary,
  UpdateTaskPayload,
  SortField,
} from '../types/task';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

export const getTasks = (
  page: number,
  pageSize: number,
  status?: TaskStatus,
  filters?: TaskFilters,
  sortBy?: SortField,
  sortDesc?: boolean,
  showDeleted?: boolean
): Promise<PagedResult<TaskSummary>> => {
  const params: Record<string, unknown> = { page, pageSize };
  if (status) params.status = status;
  if (filters?.titleContains) params.titleContains = filters.titleContains;
  if (filters?.descriptionContains) params.descriptionContains = filters.descriptionContains;
  if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters?.dateTo) params.dateTo = filters.dateTo;
  if (filters?.completedDateFrom) params.completedDateFrom = filters.completedDateFrom;
  if (filters?.completedDateTo) params.completedDateTo = filters.completedDateTo;
  if (sortBy) params.sortBy = sortBy;
  if (sortDesc) params.sortDesc = sortDesc;
  if (showDeleted) params.showDeleted = showDeleted;
  return api.get<PagedResult<TaskSummary>>('/api/tasks', { params }).then((r) => r.data);
};

export const getTaskById = (id: number): Promise<TaskDetail> =>
  api.get<TaskDetail>(`/api/tasks/${id}`).then((r) => r.data);

export const createTask = (payload: CreateTaskPayload): Promise<TaskDetail> =>
  api
    .post<TaskDetail>('/api/tasks', payload, {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
    .then((r) => r.data);

export const updateTask = (id: number, payload: UpdateTaskPayload): Promise<TaskDetail> =>
  api
    .put<TaskDetail>(`/api/tasks/${id}`, payload, {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
    .then((r) => r.data);

export const updateTaskStatus = (id: number, status: TaskStatus): Promise<TaskDetail> =>
  api.patch<TaskDetail>(`/api/tasks/${id}/status`, { status }).then((r) => r.data);

export const deleteTask = (id: number): Promise<void> =>
  api.delete(`/api/tasks/${id}`).then(() => undefined);

export const softDeleteTask = (id: number): Promise<void> =>
  api.delete(`/api/tasks/${id}/soft`).then(() => undefined);

export const restoreTask = (id: number): Promise<void> =>
  api.patch(`/api/tasks/${id}/restore`).then(() => undefined);
