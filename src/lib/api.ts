import { TOKEN_KEY } from '@/services/api';
import type {
  Lead,
  LeadPayload,
  LeadStatus,
  LeadGroupedResponse,
  Opportunity,
  OpportunityGroupedResponse,
  CreateOpportunityPayload,
  UpdateOpportunityPayload,
  OpportunityStage,
  MarkOpportunityLostPayload,
} from '@/types/api';

const base =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() ||
  (import.meta.env.VITE_API_BASE as string | undefined)?.trim() ||
  '/api';
export const API_BASE = base.replace(/\/+$/, '');

const rawMock = import.meta.env.VITE_MOCK;
export const USE_MOCK =
  rawMock === undefined || rawMock === null
    ? false
    : !['0', 'false', 'off', 'no', ''].includes(String(rawMock).trim().toLowerCase());

function resolveAuthHeader(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const headers = new Headers(init.headers as HeadersInit | undefined);
  const hasBody = init.body !== undefined && init.body !== null;
  const isFormData = typeof FormData !== 'undefined' && hasBody && init.body instanceof FormData;
  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = resolveAuthHeader();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `${response.status} ${response.statusText}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export function buildQuery(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== '');
  if (!entries.length) return '';
  const search = new URLSearchParams(entries as [string, string][]);
  return `?${search.toString()}`;
}

export async function getLeads(q?: string) {
  const query = buildQuery({ q });
  return api<LeadGroupedResponse>(`/leads${query}`);
}

export async function createLead(payload: LeadPayload) {
  return api<Lead>('/leads', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateLead(id: string, payload: Partial<LeadPayload>) {
  return api<Lead>(`/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function moveLead(id: string, status: LeadStatus) {
  return api<Lead>(`/leads/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getOpps(q?: string) {
  const query = buildQuery({ q });
  return api<OpportunityGroupedResponse>(`/opps${query}`);
}

export async function createOpp(payload: CreateOpportunityPayload) {
  return api<Opportunity>('/opps', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateOpp(id: string, payload: UpdateOpportunityPayload) {
  return api<Opportunity>(`/opps/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function moveOpp(id: string, stage: OpportunityStage) {
  return api<Opportunity>(`/opps/${id}/stage`, {
    method: 'PATCH',
    body: JSON.stringify({ stage }),
  });
}

export async function markOppLost(id: string, payload: MarkOpportunityLostPayload) {
  return api<Opportunity>(`/opps/${id}/lost`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
