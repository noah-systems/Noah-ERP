export type LeadStatus = 'NURTURING' | 'QUALIFIED' | 'DISQUALIFIED';
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
  companyName: string;
  segment: string | null;
  employeesCount: number | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  source: string | null;
  status: LeadStatus;
  ownerId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadPayload {
  companyName: string;
  segment?: string;
  employeesCount?: number;
  contactName?: string;
  phone?: string;
  email?: string;
  source?: string;
  ownerId?: string;
  notes?: string;
}

export interface LeadGroupedResponse {
  grouped: Record<LeadStatus, Lead[]>;
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
