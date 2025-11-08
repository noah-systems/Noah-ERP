export type LeadStatus = 'NURTURING' | 'QUALIFIED' | 'DISQUALIFIED';
export type OpportunityStage =
  | 'NEGOTIATION'
  | 'PRESENTATION'
  | 'PROPOSAL'
  | 'TRIAL'
  | 'TRIAL_EXPIRING'
  | 'WON'
  | 'LOST';
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
  companyName: string;
  cnpj: string | null;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  financeEmail: string | null;
  financePhone: string | null;
  subdomain: string | null;
  amount: number;
  stage: OpportunityStage;
  trialEndsAt: string | null;
  ownerId: string;
  tags: string[];
  lostReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpportunityPayload {
  companyName: string;
  cnpj?: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  financeEmail?: string;
  financePhone?: string;
  subdomain?: string;
  amount: number;
  stage?: OpportunityStage;
  trialEndsAt?: string;
  ownerId: string;
  tags?: string[];
}

export interface UpdateOpportunityPayload extends Partial<CreateOpportunityPayload> {}

export interface MoveOpportunityPayload {
  stage: OpportunityStage;
}

export interface MarkOpportunityLostPayload {
  reason?: string;
}

export interface OpportunityGroupedResponse {
  grouped: Record<OpportunityStage, Opportunity[]>;
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
