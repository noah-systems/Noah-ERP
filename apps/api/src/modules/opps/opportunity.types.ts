export const OPPORTUNITY_STAGES = [
  'NEGOTIATION',
  'PRESENTATION',
  'PROPOSAL',
  'TRIAL',
  'TRIAL_EXPIRING',
  'WON',
  'LOST',
] as const;

export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number];
