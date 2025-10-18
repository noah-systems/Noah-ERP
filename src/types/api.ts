export type LeadStage = 'NUTRICAO' | 'QUALIFICADO' | 'NAO_QUALIFICADO';
export type OpportunityStage =
  | 'NEGOCIACAO'
  | 'APRESENTACAO'
  | 'PROPOSTA'
  | 'TRIAL'
  | 'VENC_TRIAL'
  | 'VENDAS';
export type ImplementationStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  stage: LeadStage;
  order: number;
  value?: string | null;
  source?: string | null;
  ownerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadPayload {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  value?: number;
  stage?: LeadStage;
}

export interface Opportunity {
  id: string;
  title: string;
  value?: string | null;
  stage: OpportunityStage;
  order: number;
  leadId: string;
  ownerId?: string | null;
  expectedClose?: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    name: string;
    company?: string | null;
    email?: string | null;
  } | null;
}

export interface OpportunityPayload {
  title: string;
  leadId: string;
  value?: number;
  stage?: OpportunityStage;
  expectedClose?: string;
}

export interface Implementation {
  id: string;
  opportunityId: string;
  scheduledAt: string;
  status: ImplementationStatus;
  completedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  opportunity?: {
    id: string;
    title: string;
    leadId: string;
    stage: OpportunityStage;
  } | null;
}

export interface ImplementationPayload {
  opportunityId: string;
  scheduledAt: string;
  notes?: string;
}

export interface ImplementationUpdatePayload {
  scheduledAt?: string;
  status?: ImplementationStatus;
  notes?: string;
  completedAt?: string;
}

export interface Cancellation {
  id: string;
  leadId?: string | null;
  opportunityId?: string | null;
  reason?: string | null;
  requestedBy?: string | null;
  effectiveDate?: string | null;
  createdAt: string;
  lead?: {
    id: string;
    name: string;
    company?: string | null;
  } | null;
  opportunity?: {
    id: string;
    title: string;
    stage: OpportunityStage;
  } | null;
}

export interface CancellationPayload {
  leadId?: string;
  opportunityId?: string;
  reason: string;
  requestedBy?: string;
  effectiveDate?: string;
}
