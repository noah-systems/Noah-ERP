import bcrypt from 'bcryptjs';
import {
  ImplementationStatus,
  LeadStage,
  OpportunityStage,
  PrismaClient,
  UserRole,
} from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@noahomni.com.br';
const ADMIN_PASSWORD = 'D2W3£Qx!0Du#';
const ADMIN_NAME = 'Admin Noah';

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: ADMIN_NAME, passwordHash, role: UserRole.ADMIN_NOAH },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash,
      role: UserRole.ADMIN_NOAH,
    },
  });
}

async function clearDatabase() {
  await prisma.activityLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.cancellation.deleteMany();
  await prisma.implementation.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.session.deleteMany();
}

async function seedLeads(adminId: string) {
  const counters: Record<LeadStage, number> = {
    [LeadStage.NUTRICAO]: 0,
    [LeadStage.QUALIFICADO]: 0,
    [LeadStage.NAO_QUALIFICADO]: 0,
  };

  const leadsData = [
    {
      name: 'Maria Fernandes',
      email: 'maria.fernandes@example.com',
      phone: '+55 11 99999-0001',
      company: 'TechWave',
      stage: LeadStage.NUTRICAO,
      value: 15000,
      source: 'Inbound',
    },
    {
      name: 'Eduardo Lima',
      email: 'eduardo.lima@example.com',
      phone: '+55 21 98888-0002',
      company: 'GreenCore',
      stage: LeadStage.NUTRICAO,
      value: 22000,
      source: 'Evento',
    },
    {
      name: 'Fernanda Souza',
      email: 'fernanda.souza@example.com',
      phone: '+55 31 97777-0003',
      company: 'CloudAxis',
      stage: LeadStage.QUALIFICADO,
      value: 32000,
      source: 'Indicação',
    },
    {
      name: 'Ricardo Martins',
      email: 'ricardo.martins@example.com',
      phone: '+55 41 96666-0004',
      company: 'BlueOcean',
      stage: LeadStage.QUALIFICADO,
      value: 18000,
      source: 'Outbound',
    },
    {
      name: 'Ana Beatriz',
      email: 'ana.beatriz@example.com',
      phone: '+55 51 95555-0005',
      company: 'DigitalPulse',
      stage: LeadStage.NAO_QUALIFICADO,
      value: 9000,
      source: 'Landing Page',
    },
  ];

  const leads = [] as Array<{ id: string; stage: LeadStage }>;

  for (const lead of leadsData) {
    const order = counters[lead.stage]++;
    const created = await prisma.lead.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        stage: lead.stage,
        order,
        value: lead.value,
        source: lead.source,
        ownerId: adminId,
      },
    });
    leads.push({ id: created.id, stage: created.stage });
  }

  return leads;
}

async function seedOpportunities(adminId: string, leads: Array<{ id: string; stage: LeadStage }>) {
  const counters: Record<OpportunityStage, number> = {
    [OpportunityStage.NEGOCIACAO]: 0,
    [OpportunityStage.APRESENTACAO]: 0,
    [OpportunityStage.PROPOSTA]: 0,
    [OpportunityStage.TRIAL]: 0,
    [OpportunityStage.VENC_TRIAL]: 0,
    [OpportunityStage.VENDAS]: 0,
  };

  const opportunitiesData = [
    {
      title: 'TechWave - Onboarding ERP',
      leadId: leads[0]?.id,
      stage: OpportunityStage.NEGOCIACAO,
      value: 18000,
    },
    {
      title: 'GreenCore - Licenciamento',
      leadId: leads[1]?.id,
      stage: OpportunityStage.APRESENTACAO,
      value: 24000,
    },
    {
      title: 'CloudAxis - Suite Completa',
      leadId: leads[2]?.id,
      stage: OpportunityStage.PROPOSTA,
      value: 36000,
    },
    {
      title: 'BlueOcean - Integrações',
      leadId: leads[3]?.id,
      stage: OpportunityStage.TRIAL,
      value: 26000,
    },
    {
      title: 'DigitalPulse - Retomada',
      leadId: leads[4]?.id,
      stage: OpportunityStage.VENDAS,
      value: 12000,
    },
  ].filter((item) => item.leadId);

  const opportunities: Array<{ id: string; stage: OpportunityStage }> = [];

  for (const opportunity of opportunitiesData) {
    const order = counters[opportunity.stage]++;
    const created = await prisma.opportunity.create({
      data: {
        title: opportunity.title,
        stage: opportunity.stage,
        order,
        leadId: opportunity.leadId!,
        value: opportunity.value,
        ownerId: adminId,
      },
    });
    opportunities.push({ id: created.id, stage: created.stage });
  }

  return opportunities;
}

async function seedImplementations(opportunities: Array<{ id: string }>) {
  if (!opportunities.length) return;

  await prisma.implementation.create({
    data: {
      opportunityId: opportunities[0].id,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: ImplementationStatus.SCHEDULED,
      notes: 'Kick-off com equipe técnica e levantamento de integrações.',
    },
  });
}

async function seedCancellations(leads: Array<{ id: string }>, opportunities: Array<{ id: string }>) {
  if (leads[4]) {
    await prisma.cancellation.create({
      data: {
        leadId: leads[4].id,
        reason: 'Prospect optou por manter solução atual.',
        requestedBy: 'Ana Beatriz',
        effectiveDate: new Date(),
      },
    });
  }

  if (opportunities[3]) {
    await prisma.cancellation.create({
      data: {
        opportunityId: opportunities[3].id,
        reason: 'Implantação suspensa até aprovação orçamentária.',
        requestedBy: 'Ricardo Martins',
        effectiveDate: new Date(),
      },
    });
  }
}

async function seedNotesAndAttachments(adminId: string, leads: Array<{ id: string }>) {
  if (!leads.length) return;

  await prisma.note.create({
    data: {
      leadId: leads[0].id,
      content: 'Lead interessado em módulo de vendas omnichannel.',
      createdById: adminId,
    },
  });

  await prisma.attachment.create({
    data: {
      leadId: leads[0].id,
      fileName: 'briefing-techwave.pdf',
      url: 'https://example.com/briefing-techwave.pdf',
    },
  });
}

async function main() {
  const admin = await seedAdmin();
  await clearDatabase();
  const leads = await seedLeads(admin.id);
  const opportunities = await seedOpportunities(admin.id, leads);
  await seedImplementations(opportunities);
  await seedCancellations(leads, opportunities);
  await seedNotesAndAttachments(admin.id, leads);
}

main()
  .then(() => {
    console.log('Database seeded successfully.');
  })
  .catch((error) => {
    console.error('Failed to seed database', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
