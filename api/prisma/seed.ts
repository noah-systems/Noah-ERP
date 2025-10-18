import bcrypt from 'bcryptjs';
import {
  ImplementationStatus,
  LeadStage,
  OpportunityStage,
  PrismaClient,
  UserRole,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.cancellation.deleteMany();
  await prisma.implementation.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('D2W3£Qx!0Du#', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@noahomni.com.br',
      name: 'Administrador Noah',
      passwordHash: adminPassword,
      role: UserRole.ADMIN_NOAH,
    },
  });

  const leadStageOrders: Record<LeadStage, number> = {
    [LeadStage.NUTRICAO]: 0,
    [LeadStage.QUALIFICADO]: 0,
    [LeadStage.NAO_QUALIFICADO]: 0,
  };

  const leads = await Promise.all(
    [
      {
        companyName: 'Empresa A Ltda',
        contactName: 'João Silva',
        contactEmail: 'joao@empresaa.com',
        contactPhone: '(11) 98765-4321',
        segment: 'Varejo',
        employees: 50,
        origin: 'Google Ads',
        stage: LeadStage.NUTRICAO,
      },
      {
        companyName: 'Tech Solutions',
        contactName: 'Ana Costa',
        contactEmail: 'ana@techsolutions.com',
        contactPhone: '(21) 99876-5432',
        segment: 'Tecnologia',
        employees: 25,
        origin: 'Meta',
        stage: LeadStage.QUALIFICADO,
      },
      {
        companyName: 'Distribuidora XYZ',
        contactName: 'Pedro Alves',
        contactEmail: 'pedro@distribuidoraxyz.com',
        contactPhone: '(11) 97654-3210',
        segment: 'Distribuição',
        employees: 100,
        origin: 'Manual',
        stage: LeadStage.NAO_QUALIFICADO,
      },
    ].map(async (data) => {
      const order = leadStageOrders[data.stage];
      leadStageOrders[data.stage] += 1;
      return prisma.lead.create({
        data: {
          ...data,
          ownerId: admin.id,
          order,
        },
      });
    })
  );

  const opportunityStageOrders: Record<OpportunityStage, number> = {
    [OpportunityStage.NEGOCIACAO]: 0,
    [OpportunityStage.APRESENTACAO]: 0,
    [OpportunityStage.PROPOSTA]: 0,
    [OpportunityStage.TRIAL]: 0,
    [OpportunityStage.VENC_TRIAL]: 0,
    [OpportunityStage.VENDAS]: 0,
  };

  const opportunities = await Promise.all(
    [
      {
        name: 'Distribuidora XYZ - CRM',
        value: 4500,
        contactName: 'Pedro Alves',
        leadId: leads[2].id,
        modules: ['CRM', 'WhatsApp'],
        stage: OpportunityStage.NEGOCIACAO,
      },
      {
        name: 'Tech Solutions - Suite Noah',
        value: 6800,
        contactName: 'Ana Costa',
        leadId: leads[1].id,
        modules: ['CRM', 'WhatsApp', 'Campanhas'],
        stage: OpportunityStage.APRESENTACAO,
      },
      {
        name: 'Empresa A - Full',
        value: 8200,
        contactName: 'João Silva',
        leadId: leads[0].id,
        modules: ['CRM', 'Omnichannel'],
        stage: OpportunityStage.PROPOSTA,
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        workspaceSlug: 'empresaa',
      },
    ].map(async (data) => {
      const order = opportunityStageOrders[data.stage];
      opportunityStageOrders[data.stage] += 1;
      return prisma.opportunity.create({
        data: {
          ...data,
          ownerId: admin.id,
          order,
        },
      });
    })
  );

  await prisma.implementation.create({
    data: {
      opportunityId: opportunities[1].id,
      scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: ImplementationStatus.SCHEDULED,
      notes: 'Apresentação técnica com equipe de operações.',
    },
  });

  await prisma.cancellation.create({
    data: {
      leadId: leads[2].id,
      reason: 'Sem orçamento para a solução completa',
      details: 'Cliente informou que revisará no próximo trimestre.',
    },
  });

  await prisma.activityLog.createMany({
    data: [
      {
        userId: admin.id,
        entityType: 'seed',
        entityId: 'setup',
        action: 'seed',
        description: 'Dados iniciais carregados.',
      },
      {
        userId: admin.id,
        entityType: 'lead',
        entityId: leads[0].id,
        action: 'create',
        description: 'Lead criado via seed.',
        leadId: leads[0].id,
      },
      {
        userId: admin.id,
        entityType: 'opportunity',
        entityId: opportunities[0].id,
        action: 'create',
        description: 'Oportunidade criada via seed.',
        opportunityId: opportunities[0].id,
      },
    ],
  });

  console.log('Seed concluído com sucesso.');
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
