export type LeadStage = 'NUTRICAO' | 'QUALIFICADO' | 'NAO_QUALIFICADO';

export interface OwnerSummary {
  id: string;
  name: string;
  email: string;
}

export interface OpportunitySummary {
  id: string;
  name: string;
  stage: OpportunityStage;
  value: number | null;
  createdAt: string;
}

export interface Lead {
  id: string;
  companyName: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  segment?: string | null;
  employees?: number | null;
  origin?: string | null;
  notes?: string | null;
  stage: LeadStage;
  order: number;
  owner?: OwnerSummary | null;
  opportunities?: OpportunitySummary[];
  createdAt: string;
  updatedAt: string;
}

export type OpportunityStage =
  | 'NEGOCIACAO'
  | 'APRESENTACAO'
  | 'PROPOSTA'
  | 'TRIAL'
  | 'VENC_TRIAL'
  | 'VENDAS';

export interface Opportunity {
  id: string;
  name: string;
  value: number | null;
  contactName?: string | null;
  lead?: Pick<Lead, 'id' | 'companyName' | 'stage'> | null;
  owner?: OwnerSummary | null;
  modules: string[];
  stage: OpportunityStage;
  order: number;
  trialEndsAt?: string | null;
  workspaceSlug?: string | null;
  implementation?: Implementation | null;
  createdAt: string;
  updatedAt: string;
}

export type ImplementationStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Implementation {
  id: string;
  opportunity: Pick<Opportunity, 'id' | 'name' | 'stage'> & {
    leadId?: string | null;
    lead?: Pick<Lead, 'id' | 'companyName' | 'contactName'> | null;
  };
  scheduledFor: string;
  status: ImplementationStatus;
  notes?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Cancellation {
  id: string;
  reason: string;
  details?: string | null;
  cancelledAt: string;
  createdAt: string;
  updatedAt: string;
  lead?: Pick<Lead, 'id' | 'companyName' | 'stage'> | null;
  opportunity?: Pick<Opportunity, 'id' | 'name' | 'stage'> | null;
}
