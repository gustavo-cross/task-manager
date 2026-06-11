export type TaskStatus = 'Pending' | 'InProgress' | 'Completed';

export type SortField = 'title' | 'status' | 'createdAt' | 'completedAt';

export interface TaskSummary {
  id: number;
  title: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  isDeleted: boolean;
}

export interface TaskDetail {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  isDeleted: boolean;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  completedAt?: string;
}

export interface UpdateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  completedAt?: string;
}

export interface TaskFilters {
  titleContains?: string;
  descriptionContains?: string;
  dateFrom?: string;
  dateTo?: string;
  completedDateFrom?: string;
  completedDateTo?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
