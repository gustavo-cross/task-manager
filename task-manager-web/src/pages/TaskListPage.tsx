import { useCallback, useEffect, useRef, useState } from 'react';
import TaskForm from '../components/TaskForm';
import { deleteTask, getTasks, restoreTask, softDeleteTask, updateTaskStatus } from '../services/taskService';
import type { SortField, TaskFilters, TaskStatus, TaskSummary } from '../types/task';
import type { Theme } from '../App';

// ===== ICONS =====
const CheckSquareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const SunIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const TrashBinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const RestoreIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ClipboardListIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

const TrashEmptyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const XSmallIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SortDefaultIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
    <polyline points="8 6 12 2 16 6" />
    <polyline points="8 18 12 22 16 18" />
  </svg>
);

const SortAscIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 6 12 2 16 6" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);

const SortDescIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 18 12 22 16 18" />
    <line x1="12" y1="22" x2="12" y2="2" />
  </svg>
);

const ExpiredWarningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ===== STATUS CONFIG =====
const STATUS_CONFIG: Record<TaskStatus, { label: string; badgeClass: string }> = {
  Pending: { label: 'Pendente', badgeClass: 'badge-pending' },
  InProgress: { label: 'Em Progresso', badgeClass: 'badge-progress' },
  Completed: { label: 'Concluída', badgeClass: 'badge-completed' },
};

const STATUS_OPTIONS: TaskStatus[] = ['Pending', 'InProgress', 'Completed'];

const FILTER_OPTIONS: { value: TaskStatus | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'Pending', label: 'Pendente' },
  { value: 'InProgress', label: 'Em Progresso' },
  { value: 'Completed', label: 'Concluída' },
];

const PAGE_SIZE_OPTIONS: { value: number; label: string }[] = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 0, label: 'Todas' },
];

const SORTABLE_COLUMNS: { field: SortField; label: string }[] = [
  { field: 'title', label: 'Título' },
  { field: 'status', label: 'Status' },
  { field: 'createdAt', label: 'Criação' },
  { field: 'completedAt', label: 'Conclusão' },
];

const EMPTY_FILTERS: TaskFilters = {
  titleContains: '',
  descriptionContains: '',
  dateFrom: '',
  dateTo: '',
  completedDateFrom: '',
  completedDateTo: '',
};

function countActiveFilters(filters: TaskFilters): number {
  return [
    filters.titleContains,
    filters.descriptionContains,
    filters.dateFrom,
    filters.dateTo,
    filters.completedDateFrom,
    filters.completedDateTo,
  ].filter(Boolean).length;
}

function isTaskExpired(task: TaskSummary): boolean {
  if (!task.completedAt || task.status === 'Completed') return false;
  return new Date(task.completedAt) < new Date();
}

// ===== DIALOG COMPONENT =====
interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

function Dialog({ open, title, onClose, children, wide }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog"
        style={wide ? { maxWidth: 560 } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <h3>{title}</h3>
          <button className="dialog-close" onClick={onClose} aria-label="Fechar">
            <CloseIcon />
          </button>
        </div>
        <div className="dialog-body">{children}</div>
      </div>
    </div>
  );
}

// ===== SORT HEADER CELL =====
interface SortHeaderProps {
  field: SortField;
  label: string;
  sortBy: SortField | undefined;
  sortDesc: boolean;
  onSort: (field: SortField) => void;
}

function SortHeader({ field, label, sortBy, sortDesc, onSort }: SortHeaderProps) {
  const isActive = sortBy === field;

  return (
    <th
      onClick={() => onSort(field)}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        {label}
        <span style={{ color: isActive ? 'var(--accent)' : undefined, display: 'flex' }}>
          {!isActive && <SortDefaultIcon />}
          {isActive && !sortDesc && <SortAscIcon />}
          {isActive && sortDesc && <SortDescIcon />}
        </span>
      </span>
    </th>
  );
}

// ===== MAIN PAGE =====
interface TaskListPageProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export default function TaskListPage({ theme, onToggleTheme }: TaskListPageProps) {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [advancedFilters, setAdvancedFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortDesc, setSortDesc] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TaskSummary | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [statusPopupTaskId, setStatusPopupTaskId] = useState<number | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const activeFilterCount = countActiveFilters(advancedFilters);

  const filterPopupRef = useRef<HTMLDivElement>(null);
  const statusPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showFilterDialog) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (filterPopupRef.current && !filterPopupRef.current.contains(e.target as Node)) {
        setShowFilterDialog(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowFilterDialog(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFilterDialog]);

  useEffect(() => {
    if (statusPopupTaskId === null) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (statusPopupRef.current && !statusPopupRef.current.contains(e.target as Node)) {
        setStatusPopupTaskId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStatusPopupTaskId(null);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [statusPopupTaskId]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTasks(
        page,
        pageSize,
        statusFilter || undefined,
        advancedFilters,
        sortBy,
        sortDesc,
        showTrash
      );
      setTasks(result.items);
      setTotalPages(result.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, advancedFilters, sortBy, sortDesc, showTrash]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleToggleTrash = () => {
    setShowTrash((prev) => !prev);
    setPage(1);
  };

  const handleStatusFilter = (value: TaskStatus | '') => {
    setStatusFilter(value);
    setPage(1);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDesc((prev) => !prev);
    } else {
      setSortBy(field);
      setSortDesc(false);
    }
    setPage(1);
  };

  const handleOpenFilterDialog = () => {
    setPendingFilters(advancedFilters);
    setShowFilterDialog(true);
  };

  const handleApplyFilters = () => {
    setAdvancedFilters(pendingFilters);
    setPage(1);
    setShowFilterDialog(false);
  };

  const handleClearFilters = () => {
    setPendingFilters(EMPTY_FILTERS);
    setAdvancedFilters(EMPTY_FILTERS);
    setPage(1);
    setShowFilterDialog(false);
  };

  const handleEdit = (task: TaskSummary) => {
    setEditingId(task.id);
    setShowFormDialog(true);
  };

  const handleNew = () => {
    setEditingId(undefined);
    setShowFormDialog(true);
  };

  const handleFormSuccess = () => {
    setShowFormDialog(false);
    loadTasks();
  };

  const handleMoveToTrash = async () => {
    if (!deleteTarget) return;
    await softDeleteTask(deleteTarget.id);
    setDeleteTarget(null);
    loadTasks();
  };

  const handlePermanentDelete = async () => {
    if (!deleteTarget) return;
    await deleteTask(deleteTarget.id);
    setDeleteTarget(null);
    loadTasks();
  };

  const handleRestore = async (task: TaskSummary) => {
    await restoreTask(task.id);
    loadTasks();
  };

  const handleStatusChange = async (task: TaskSummary, status: TaskStatus) => {
    if (status === task.status) {
      setStatusPopupTaskId(null);
      return;
    }
    setStatusUpdating(true);
    try {
      await updateTaskStatus(task.id, status);
      setStatusPopupTaskId(null);
      await loadTasks();
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-brand">
            <div className="app-brand-icon">
              <CheckSquareIcon />
            </div>
            <span className="app-brand-title" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>Gerenciador de Tarefas</span>
          </div>

          <div className="app-header-actions">
            <button className="theme-toggle" onClick={onToggleTheme} aria-label="Alternar tema">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            {!showTrash && (
              <button className="btn btn-primary" onClick={handleNew}>
                <PlusIcon />
                Nova Tarefa
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <main className="page-content">

        {/* Trash banner */}
        {showTrash && (
          <div className="trash-banner" style={{ marginBottom: '16px' }}>
            <TrashBinIcon />
            <span>Lixeira de Tarefas — itens excluídos ficam aqui até serem removidos permanentemente</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="page-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Status filter */}
            <div className="filter-group">
              {FILTER_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  className={`filter-btn${statusFilter === value ? ' filter-btn-active' : ''}`}
                  onClick={() => handleStatusFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Advanced filter button + popup */}
            <div style={{ position: 'relative' }} ref={filterPopupRef}>
              <button
                className={`btn btn-sm${activeFilterCount > 0 ? ' btn-primary' : ' btn-outline'}`}
                onClick={showFilterDialog ? () => setShowFilterDialog(false) : handleOpenFilterDialog}
                style={{ gap: '6px' }}
              >
                <FilterIcon />
                {activeFilterCount > 0 ? `Filtros (${activeFilterCount})` : 'Filtros'}
              </button>

              {showFilterDialog && (
                <div className="filter-popup">
                  <div className="filter-popup-body">
                    <div className="form-field">
                      <label className="form-label" htmlFor="filter-title">Título</label>
                      <input
                        id="filter-title"
                        className="form-input"
                        type="text"
                        placeholder="Buscar por título..."
                        value={pendingFilters.titleContains ?? ''}
                        onChange={(e) =>
                          setPendingFilters((f) => ({ ...f, titleContains: e.target.value }))
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label" htmlFor="filter-desc">Descrição</label>
                      <input
                        id="filter-desc"
                        className="form-input"
                        type="text"
                        placeholder="Buscar por descrição..."
                        value={pendingFilters.descriptionContains ?? ''}
                        onChange={(e) =>
                          setPendingFilters((f) => ({ ...f, descriptionContains: e.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <div className="form-label" style={{ marginBottom: '6px', fontWeight: 600 }}>Data de Criação</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div className="form-field" style={{ marginBottom: 0 }}>
                          <label className="form-label" htmlFor="filter-date-from">De</label>
                          <input
                            id="filter-date-from"
                            className="form-input"
                            type="date"
                            value={pendingFilters.dateFrom ?? ''}
                            onChange={(e) =>
                              setPendingFilters((f) => ({ ...f, dateFrom: e.target.value }))
                            }
                          />
                        </div>
                        <div className="form-field" style={{ marginBottom: 0 }}>
                          <label className="form-label" htmlFor="filter-date-to">Até</label>
                          <input
                            id="filter-date-to"
                            className="form-input"
                            type="date"
                            value={pendingFilters.dateTo ?? ''}
                            onChange={(e) =>
                              setPendingFilters((f) => ({ ...f, dateTo: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="form-label" style={{ marginBottom: '6px', fontWeight: 600 }}>Data de Conclusão</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div className="form-field" style={{ marginBottom: 0 }}>
                          <label className="form-label" htmlFor="filter-completed-date-from">De</label>
                          <input
                            id="filter-completed-date-from"
                            className="form-input"
                            type="date"
                            value={pendingFilters.completedDateFrom ?? ''}
                            onChange={(e) =>
                              setPendingFilters((f) => ({ ...f, completedDateFrom: e.target.value }))
                            }
                          />
                        </div>
                        <div className="form-field" style={{ marginBottom: 0 }}>
                          <label className="form-label" htmlFor="filter-completed-date-to">Até</label>
                          <input
                            id="filter-completed-date-to"
                            className="form-input"
                            type="date"
                            value={pendingFilters.completedDateTo ?? ''}
                            onChange={(e) =>
                              setPendingFilters((f) => ({ ...f, completedDateTo: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="filter-popup-actions">
                    <button className="btn btn-ghost btn-sm" onClick={handleClearFilters}>
                      Limpar
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleApplyFilters}>
                      Aplicar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleClearFilters}
                style={{ color: 'var(--text-muted)', gap: '5px' }}
              >
                <XSmallIcon />
                Limpar filtros
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Trash toggle button */}
            {showTrash ? (
              <button
                className="btn btn-outline btn-sm"
                onClick={handleToggleTrash}
                style={{ gap: '6px', color: '#b45309', borderColor: 'rgba(245,158,11,0.4)' }}
              >
                <CloseIcon />
                Fechar Lixeira
              </button>
            ) : (
              <button
                className="btn btn-outline btn-sm"
                onClick={handleToggleTrash}
                style={{ gap: '6px' }}
              >
                <TrashBinIcon />
                Lixeira
              </button>
            )}

            {/* Page size selector */}
            <div className="filter-group">
              {PAGE_SIZE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  className={`filter-btn${pageSize === value ? ' filter-btn-active' : ''}`}
                  onClick={() => handlePageSizeChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="task-table-wrapper">
          {loading ? (
            <div className="loading-state">
              {showTrash ? 'Carregando lixeira...' : 'Carregando tarefas...'}
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                {showTrash ? <TrashEmptyIcon /> : <ClipboardListIcon />}
              </div>
              {showTrash ? (
                <>
                  <h3>Lixeira vazia</h3>
                  <p>
                    {statusFilter || activeFilterCount > 0
                      ? 'Nenhuma tarefa excluída encontrada para esses filtros.'
                      : 'Nenhuma tarefa foi enviada para a lixeira.'}
                  </p>
                </>
              ) : (
                <>
                  <h3>Nenhuma tarefa encontrada</h3>
                  <p>
                    {statusFilter || activeFilterCount > 0
                      ? 'Tente outros filtros ou crie uma nova tarefa.'
                      : 'Crie sua primeira tarefa para começar.'}
                  </p>
                </>
              )}
            </div>
          ) : (
            <table className="task-table">
              <thead>
                <tr>
                  {SORTABLE_COLUMNS.map(({ field, label }) => (
                    <SortHeader
                      key={field}
                      field={field}
                      label={label}
                      sortBy={sortBy}
                      sortDesc={sortDesc}
                      onSort={handleSort}
                    />
                  ))}
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const { label, badgeClass } = STATUS_CONFIG[task.status];
                  const expired = isTaskExpired(task);

                  return (
                    <tr key={task.id}>
                      <td className="task-title-cell">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {expired && !showTrash && (
                            <span
                              title="Tarefa expirada - prazo vencido"
                              style={{ color: '#f59e0b', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                            >
                              <ExpiredWarningIcon />
                            </span>
                          )}
                          <span style={expired && !showTrash ? { color: '#f59e0b' } : undefined}>
                            {task.title}
                          </span>
                        </span>
                      </td>
                      <td>
                        {showTrash ? (
                          <span className={`badge ${badgeClass}`}>{label}</span>
                        ) : (
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              type="button"
                              className={`badge ${badgeClass}`}
                              style={{ cursor: 'pointer', border: 'none' }}
                              onClick={() =>
                                setStatusPopupTaskId((prev) => (prev === task.id ? null : task.id))
                              }
                            >
                              {label}
                            </button>

                            {statusPopupTaskId === task.id && (
                              <div className="status-popup" ref={statusPopupRef}>
                                {STATUS_OPTIONS.map((statusOption) => (
                                  <button
                                    key={statusOption}
                                    type="button"
                                    className={`status-popup-option${
                                      statusOption === task.status ? ' status-popup-option-active' : ''
                                    }`}
                                    disabled={statusUpdating}
                                    onClick={() => handleStatusChange(task, statusOption)}
                                  >
                                    <span className={`badge ${STATUS_CONFIG[statusOption].badgeClass}`}>
                                      {STATUS_CONFIG[statusOption].label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="task-date-cell">
                        {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="task-date-cell">
                        {task.completedAt
                          ? new Date(task.completedAt).toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                      <td>
                        <div className="task-actions-cell">
                          {showTrash ? (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleRestore(task)}
                              aria-label="Restaurar tarefa"
                              style={{ gap: '5px' }}
                            >
                              <RestoreIcon />
                              Restaurar
                            </button>
                          ) : (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleEdit(task)}
                              aria-label="Editar tarefa"
                            >
                              <EditIcon />
                              Editar
                            </button>
                          )}
                          <button
                            className="btn btn-ghost-danger btn-sm"
                            onClick={() => setDeleteTarget(task)}
                            aria-label="Excluir tarefa"
                          >
                            <TrashIcon />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination — hidden when pageSize=0 (Todas) */}
        {pageSize > 0 && totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-outline btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeftIcon />
              Anterior
            </button>
            <span className="pagination-info">
              Página {page} de {totalPages}
            </span>
            <button
              className="btn btn-outline btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </main>

      {/* ===== TASK FORM DIALOG ===== */}
      <Dialog
        open={showFormDialog}
        title={editingId !== undefined ? 'Editar Tarefa' : 'Nova Tarefa'}
        onClose={() => setShowFormDialog(false)}
      >
        <TaskForm
          taskId={editingId}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowFormDialog(false)}
        />
      </Dialog>

      {/* ===== DELETE CONFIRM DIALOG ===== */}
      {showTrash ? (
        /* Trash view: permanent delete only */
        <Dialog
          open={deleteTarget !== null}
          title="Excluir Permanentemente"
          onClose={() => setDeleteTarget(null)}
        >
          <div className="delete-dialog-content">
            <div className="delete-dialog-icon">
              <AlertTriangleIcon />
            </div>
            <p className="delete-dialog-text">
              Tem certeza que deseja excluir permanentemente a tarefa{' '}
              <strong>"{deleteTarget?.title}"</strong>?{' '}
              Esta ação não pode ser desfeita.
            </p>
            <div className="delete-dialog-actions">
              <button className="btn btn-danger" onClick={handlePermanentDelete}>
                <TrashIcon />
                Excluir Permanentemente
              </button>
            </div>
          </div>
        </Dialog>
      ) : (
        /* Normal view: move to trash or permanent delete */
        <Dialog
          open={deleteTarget !== null}
          title="Excluir Tarefa"
          onClose={() => setDeleteTarget(null)}
        >
          <div className="delete-dialog-content">
            <div className="delete-dialog-icon">
              <AlertTriangleIcon />
            </div>
            <p className="delete-dialog-text">
              O que deseja fazer com a tarefa{' '}
              <strong>"{deleteTarget?.title}"</strong>?
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={handleMoveToTrash} style={{ gap: '6px' }}>
                <TrashBinIcon />
                Mover para Lixeira
              </button>
              <button className="btn btn-danger" onClick={handlePermanentDelete} style={{ gap: '6px' }}>
                <TrashIcon />
                Excluir Permanentemente
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
