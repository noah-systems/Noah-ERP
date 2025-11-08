import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { api } from '../lib/api';

type ImplementationTaskStatus = 'PENDING' | 'SCHEDULED' | 'DONE' | 'UNSUCCESSFUL';

type ImplementationTask = {
  id: string;
  accountId: string;
  domain: string;
  status: ImplementationTaskStatus;
  assigneeId: string | null;
  scheduledAt: string | null;
  notes: string | null;
  position: number;
  createdById: string;
  segment?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ImplementationEventType = 'SCHEDULED' | 'DONE' | 'UNSUCCESSFUL' | 'COMMENT';

type ImplementationEvent = {
  id: string;
  taskId: string;
  type: ImplementationEventType;
  payload: Record<string, unknown> | null;
  createdById: string;
  createdAt: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type PaginatedResponse = {
  data: ImplementationTask[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type FilterState = {
  q: string;
  status: ImplementationTaskStatus | 'ALL';
  from: string;
  to: string;
  assigneeId: string;
  segment: string;
};

type ModalState =
  | { type: 'create' }
  | { type: 'schedule'; task: ImplementationTask }
  | { type: 'complete'; task: ImplementationTask }
  | { type: 'unsuccessful'; task: ImplementationTask }
  | { type: 'details'; task: ImplementationTask }
  | null;

const STATUS_ORDER: ImplementationTaskStatus[] = ['PENDING', 'SCHEDULED', 'DONE', 'UNSUCCESSFUL'];

const STATUS_CONFIG: Record<ImplementationTaskStatus, { title: string; tone: string }> = {
  PENDING: { title: 'Pendente Agendamento', tone: '#f97316' },
  SCHEDULED: { title: 'Agendado', tone: '#0ea5e9' },
  DONE: { title: 'Implantação Realizada', tone: '#16a34a' },
  UNSUCCESSFUL: { title: 'Sem Sucesso', tone: '#ef4444' },
};

const DEFAULT_FILTERS: FilterState = {
  q: '',
  status: 'ALL',
  from: '',
  to: '',
  assigneeId: '',
  segment: '',
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '';
  return dateFormatter.format(date);
}

function toLocalDateTimeInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function statusLabel(status: ImplementationTaskStatus): string {
  return STATUS_CONFIG[status]?.title ?? status;
}

function payloadNote(payload: Record<string, unknown> | null): string | undefined {
  if (!payload) return undefined;
  if (typeof payload.notes === 'string') return payload.notes;
  return undefined;
}

export default function Implantacao() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [formFilters, setFormFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [tasks, setTasks] = useState<ImplementationTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [events, setEvents] = useState<ImplementationEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ status: ImplementationTaskStatus; beforeId: string | null } | null>(
    null,
  );

  const usersById = useMemo(() => {
    const map = new Map<string, User>();
    for (const user of users) {
      map.set(user.id, user);
    }
    return map;
  }, [users]);

  const grouped = useMemo(() => {
    const base: Record<ImplementationTaskStatus, ImplementationTask[]> = {
      PENDING: [],
      SCHEDULED: [],
      DONE: [],
      UNSUCCESSFUL: [],
    };
    for (const task of tasks) {
      base[task.status]?.push(task);
    }
    for (const status of STATUS_ORDER) {
      base[status].sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt));
    }
    return base;
  }, [tasks]);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api<User[]>('/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Falha ao carregar usuários', err);
    }
  }, []);

  const fetchTasks = useCallback(
    async (activeFilters: FilterState) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('pageSize', '200');
        if (activeFilters.q.trim()) params.set('q', activeFilters.q.trim());
        if (activeFilters.status !== 'ALL') params.set('status', activeFilters.status);
        if (activeFilters.from) params.set('from', activeFilters.from);
        if (activeFilters.to) params.set('to', activeFilters.to);
        if (activeFilters.assigneeId) params.set('assigneeId', activeFilters.assigneeId);
        if (activeFilters.segment.trim()) params.set('segment', activeFilters.segment.trim());
        const response = await api<PaginatedResponse>(`/implementation/tasks?${params.toString()}`);
        setTasks(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        setError(err?.message || 'Falha ao carregar tarefas de implantação');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    void fetchTasks(filters);
  }, [fetchTasks, filters]);

  const refresh = useCallback(() => {
    void fetchTasks(filters);
  }, [fetchTasks, filters]);

  const handleOpenDetails = useCallback(
    async (task: ImplementationTask) => {
      setModal({ type: 'details', task });
      setEvents([]);
      setEventsLoading(true);
      try {
        const data = await api<ImplementationEvent[]>(`/implementation/tasks/${task.id}/events`);
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Falha ao carregar eventos', err);
      } finally {
        setEventsLoading(false);
      }
    },
    [],
  );

  const closeModal = () => {
    setModal(null);
    setEvents([]);
  };

  const handleCreate = async (form: {
    accountId: string;
    domain: string;
    createdById: string;
    notes?: string;
    segment?: string;
  }) => {
    try {
      await api('/implementation/tasks', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      closeModal();
      await fetchTasks(filters);
    } catch (err: any) {
      alert(err?.message || 'Não foi possível criar a tarefa.');
    }
  };

  const handleSchedule = async (taskId: string, payload: { scheduledAt: string; assigneeId: string; performedById: string; notes?: string }) => {
    try {
      await api(`/implementation/tasks/${taskId}/schedule`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      closeModal();
      await fetchTasks(filters);
    } catch (err: any) {
      alert(err?.message || 'Não foi possível agendar a implantação.');
    }
  };

  const handleComplete = async (taskId: string, payload: { performedById: string; notes?: string }) => {
    try {
      await api(`/implementation/tasks/${taskId}/complete`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      closeModal();
      await fetchTasks(filters);
    } catch (err: any) {
      alert(err?.message || 'Não foi possível concluir a implantação.');
    }
  };

  const handleUnsuccessful = async (taskId: string, payload: { performedById: string; notes?: string }) => {
    try {
      await api(`/implementation/tasks/${taskId}/unsuccessful`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      closeModal();
      await fetchTasks(filters);
    } catch (err: any) {
      alert(err?.message || 'Não foi possível marcar como sem sucesso.');
    }
  };

  const handleDrop = async (status: ImplementationTaskStatus) => {
    if (!draggingId) return;
    const target = dropTarget?.status === status ? dropTarget : { status, beforeId: null };
    const column = grouped[status] ?? [];
    const position = target.beforeId ? column.findIndex((t) => t.id === target.beforeId) : column.length;
    try {
      await api(`/implementation/tasks/${draggingId}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ status, position }),
      });
      await fetchTasks(filters);
    } catch (err: any) {
      alert(err?.message || 'Falha ao mover card.');
    } finally {
      setDraggingId(null);
      setDropTarget(null);
    }
  };

  const renderCard = (task: ImplementationTask) => {
    const assignee = task.assigneeId ? usersById.get(task.assigneeId) : null;
    const scheduled = formatDate(task.scheduledAt);
    const segment = task.segment?.trim();
    return (
      <div
        key={task.id}
        className="card"
        draggable
        onDragStart={(e) => {
          setDraggingId(task.id);
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', task.id);
        }}
        onDragEnd={() => {
          setDraggingId(null);
          setDropTarget(null);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDropTarget({ status: task.status, beforeId: task.id });
        }}
        style={{
          padding: 12,
          marginBottom: 12,
          border: draggingId === task.id ? '2px dashed var(--color-primary)' : '1px solid var(--color-border)',
          opacity: draggingId === task.id ? 0.6 : 1,
          cursor: 'grab',
          display: 'grid',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>{task.domain}</div>
          <details style={{ position: 'relative' }}>
            <summary style={{ cursor: 'pointer' }}>⋯</summary>
            <div className="card" style={{ padding: 8, position: 'absolute', zIndex: 10, minWidth: 180, right: 0, top: 24 }}>
              <button className="btn ghost" onClick={() => void handleOpenDetails(task)} style={{ width: '100%', marginBottom: 4 }}>
                Ver detalhes
              </button>
              <button className="btn ghost" onClick={() => setModal({ type: 'schedule', task })} style={{ width: '100%', marginBottom: 4 }}>
                Agendar
              </button>
              <button className="btn ghost" onClick={() => setModal({ type: 'complete', task })} style={{ width: '100%', marginBottom: 4 }}>
                Concluir
              </button>
              <button className="btn ghost" onClick={() => setModal({ type: 'unsuccessful', task })} style={{ width: '100%' }}>
                Marcar sem sucesso
              </button>
            </div>
          </details>
        </div>
        {segment && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'rgba(148, 163, 184, 0.16)',
                color: '#475569',
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 12,
              }}
            >
              {segment}
            </span>
          </div>
        )}
        {assignee && (
          <div style={{ fontSize: 13, color: '#475569' }}>
            Responsável: <strong>{assignee.name}</strong>
          </div>
        )}
        {scheduled && (
          <div style={{ fontSize: 13, color: '#0369a1' }}>Agendado para {scheduled}</div>
        )}
        {task.notes && (
          <div style={{ fontSize: 13, color: '#334155' }}>{task.notes}</div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Implantação</div>
            <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>
              Gerencie agendamentos, responsáveis e histórico das implantações.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => setModal({ type: 'create' })}>
              Nova implantação
            </button>
            <button className="btn ghost" onClick={refresh}>
              Atualizar
            </button>
          </div>
        </div>
        <form
          style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
          onSubmit={(e) => {
            e.preventDefault();
            setFilters(formFilters);
          }}
        >
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="label">Busca (cliente/domínio)</span>
            <input
              className="input"
              value={formFilters.q}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Ex.: empresa.com.br"
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="label">Status</span>
            <select
              className="input"
              value={formFilters.status}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, status: e.target.value as FilterState['status'] }))}
            >
              <option value="ALL">Todos</option>
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="label">Período inicial</span>
            <input
              className="input"
              type="date"
              value={formFilters.from}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, from: e.target.value }))}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="label">Período final</span>
            <input
              className="input"
              type="date"
              value={formFilters.to}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, to: e.target.value }))}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="label">Responsável</span>
            <select
              className="input"
              value={formFilters.assigneeId}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, assigneeId: e.target.value }))}
            >
              <option value="">Qualquer</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="label">Segmento</span>
            <input
              className="input"
              value={formFilters.segment}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, segment: e.target.value }))}
              placeholder="Ex.: Tecnologia"
            />
          </label>
          <div style={{ alignSelf: 'end', display: 'flex', gap: 8 }}>
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                setFormFilters(DEFAULT_FILTERS);
                setFilters(DEFAULT_FILTERS);
              }}
            >
              Limpar filtros
            </button>
            <button className="btn" type="submit">
              Aplicar filtros
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="card" style={{ padding: 12, color: '#ef4444', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        alignItems: 'start',
      }}>
        {STATUS_ORDER.map((status) => (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDropTarget({ status, beforeId: null });
            }}
            onDrop={(e) => {
              e.preventDefault();
              void handleDrop(status);
            }}
            style={{
              display: 'grid',
              gap: 12,
              background: 'rgba(148, 163, 184, 0.1)',
              borderRadius: 12,
              padding: 12,
              minHeight: 320,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: STATUS_CONFIG[status].tone }}>{STATUS_CONFIG[status].title}</div>
              <span style={{ fontSize: 12, color: '#64748b' }}>{grouped[status]?.length ?? 0}</span>
            </div>
            <div>
              {loading && grouped[status]?.length === 0 && (
                <div style={{ color: 'var(--color-muted)', fontSize: 13 }}>Carregando...</div>
              )}
              {!loading && grouped[status]?.length === 0 && (
                <div style={{ color: 'var(--color-muted)', fontSize: 13 }}>Nenhuma tarefa nesta coluna.</div>
              )}
              {(grouped[status] ?? []).map((task) => renderCard(task))}
            </div>
          </div>
        ))}
      </div>

      {modal?.type === 'create' && (
        <CreateTaskModal users={users} onClose={closeModal} onSubmit={handleCreate} />
      )}
      {modal?.type === 'schedule' && (
        <ScheduleModal users={users} task={modal.task} onClose={closeModal} onSubmit={handleSchedule} />
      )}
      {modal?.type === 'complete' && (
        <StatusModal
          title="Concluir implantação"
          description="Informe quem executou a implantação e notas adicionais."
          users={users}
          task={modal.task}
          onClose={closeModal}
          onSubmit={handleComplete}
          actionLabel="Concluir"
          tone="#16a34a"
        />
      )}
      {modal?.type === 'unsuccessful' && (
        <StatusModal
          title="Marcar como sem sucesso"
          description="Registre quem reportou o insucesso e o contexto."
          users={users}
          task={modal.task}
          onClose={closeModal}
          onSubmit={handleUnsuccessful}
          actionLabel="Confirmar"
          tone="#ef4444"
        />
      )}
      {modal?.type === 'details' && (
        <DetailsModal task={modal.task} events={events} loading={eventsLoading} usersById={usersById} onClose={closeModal} />
      )}
    </div>
  );
}

type CreateTaskModalProps = {
  users: User[];
  onClose: () => void;
  onSubmit: (payload: { accountId: string; domain: string; createdById: string; notes?: string; segment?: string }) => Promise<void> | void;
};

function CreateTaskModal({ users, onClose, onSubmit }: CreateTaskModalProps) {
  const [accountId, setAccountId] = useState('');
  const [domain, setDomain] = useState('');
  const [createdById, setCreatedById] = useState('');
  const [segment, setSegment] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accountId || !domain || !createdById) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    await onSubmit({ accountId, domain, createdById, segment: segment || undefined, notes: notes || undefined });
  };

  return (
    <Modal title="Nova implantação" onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <label className="modal-field">
          <span>Conta (UUID)</span>
          <input className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)} required />
        </label>
        <label className="modal-field">
          <span>Domínio / Cliente</span>
          <input className="input" value={domain} onChange={(e) => setDomain(e.target.value)} required />
        </label>
        <label className="modal-field">
          <span>Criado por</span>
          <select className="input" value={createdById} onChange={(e) => setCreatedById(e.target.value)} required>
            <option value="">Selecione um usuário</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        <label className="modal-field">
          <span>Segmento (opcional)</span>
          <input className="input" value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="Ex.: Varejo" />
        </label>
        <label className="modal-field">
          <span>Notas (opcional)</span>
          <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>
        <div className="modal-actions">
          <button className="btn ghost" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn" type="submit">
            Criar
          </button>
        </div>
      </form>
    </Modal>
  );
}

type ScheduleModalProps = {
  users: User[];
  task: ImplementationTask;
  onClose: () => void;
  onSubmit: (taskId: string, payload: { scheduledAt: string; assigneeId: string; performedById: string; notes?: string }) => Promise<void> | void;
};

function ScheduleModal({ users, task, onClose, onSubmit }: ScheduleModalProps) {
  const [scheduledAt, setScheduledAt] = useState(() => (task.scheduledAt ? toLocalDateTimeInput(task.scheduledAt) : ''));
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? '');
  const [performedById, setPerformedById] = useState('');
  const [notes, setNotes] = useState(task.notes ?? '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!scheduledAt || !assigneeId || !performedById) {
      alert('Defina data, responsável e executor.');
      return;
    }
    await onSubmit(task.id, { scheduledAt: new Date(scheduledAt).toISOString(), assigneeId, performedById, notes: notes || undefined });
  };

  return (
    <Modal title={`Agendar implantação — ${task.domain}`} onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <label className="modal-field">
          <span>Data e hora</span>
          <input
            className="input"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </label>
        <label className="modal-field">
          <span>Responsável</span>
          <select className="input" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} required>
            <option value="">Selecione um usuário</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        <label className="modal-field">
          <span>Executor</span>
          <select className="input" value={performedById} onChange={(e) => setPerformedById(e.target.value)} required>
            <option value="">Selecione quem agendou</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        <label className="modal-field">
          <span>Observações</span>
          <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>
        <div className="modal-actions">
          <button className="btn ghost" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn" type="submit">
            Agendar
          </button>
        </div>
      </form>
    </Modal>
  );
}

type StatusModalProps = {
  title: string;
  description: string;
  actionLabel: string;
  tone: string;
  users: User[];
  task: ImplementationTask;
  onClose: () => void;
  onSubmit: (taskId: string, payload: { performedById: string; notes?: string }) => Promise<void> | void;
};

function StatusModal({ title, description, actionLabel, tone, users, task, onClose, onSubmit }: StatusModalProps) {
  const [performedById, setPerformedById] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!performedById) {
      alert('Selecione quem executou a ação.');
      return;
    }
    await onSubmit(task.id, { performedById, notes: notes || undefined });
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>{description}</p>
        <label className="modal-field">
          <span>Executor</span>
          <select className="input" value={performedById} onChange={(e) => setPerformedById(e.target.value)} required>
            <option value="">Selecione um usuário</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        <label className="modal-field">
          <span>Notas</span>
          <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>
        <div className="modal-actions">
          <button className="btn ghost" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn" type="submit" style={{ background: tone, borderColor: tone }}>
            {actionLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

type DetailsModalProps = {
  task: ImplementationTask;
  events: ImplementationEvent[];
  loading: boolean;
  usersById: Map<string, User>;
  onClose: () => void;
};

function DetailsModal({ task, events, loading, usersById, onClose }: DetailsModalProps) {
  return (
    <Modal title={`Histórico — ${task.domain}`} onClose={onClose}>
      <div className="modal-body" style={{ display: 'grid', gap: 12 }}>
        <div style={{ fontSize: 14 }}>
          <strong>Status atual:</strong> {statusLabel(task.status)}
        </div>
        {task.scheduledAt && (
          <div style={{ fontSize: 14 }}>
            <strong>Agendado em:</strong> {formatDate(task.scheduledAt)}
          </div>
        )}
        {task.notes && (
          <div style={{ fontSize: 14 }}>
            <strong>Notas:</strong> {task.notes}
          </div>
        )}
        <div style={{ fontWeight: 600, marginTop: 8 }}>Linha do tempo</div>
        {loading && <div style={{ color: 'var(--color-muted)' }}>Carregando eventos…</div>}
        {!loading && events.length === 0 && <div style={{ color: 'var(--color-muted)' }}>Nenhum evento registrado.</div>}
        {!loading &&
          events.map((event) => {
            const creator = usersById.get(event.createdById);
            const note = payloadNote(event.payload);
            return (
              <div key={event.id} className="card" style={{ padding: 12, background: 'rgba(148,163,184,0.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontWeight: 600 }}>{eventTypeLabel(event.type)}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{formatDate(event.createdAt)}</div>
                </div>
                {creator && <div style={{ fontSize: 13 }}>Por {creator.name}</div>}
                {note && <div style={{ fontSize: 13, color: '#334155' }}>{note}</div>}
              </div>
            );
          })}
      </div>
    </Modal>
  );
}

function eventTypeLabel(type: ImplementationEventType): string {
  switch (type) {
    case 'SCHEDULED':
      return 'Agendamento';
    case 'DONE':
      return 'Implantação concluída';
    case 'UNSUCCESSFUL':
      return 'Marcado como sem sucesso';
    case 'COMMENT':
    default:
      return 'Comentário';
  }
}

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 24,
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 520, padding: 20, position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          ✕
        </button>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export type { ImplementationTask, ImplementationEvent, User };
