const { PrismaClient, Role, Channel, ItemKind } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const db = new PrismaClient()

async function main() {
  await Promise.all([
    db.leadStatus.upsert({ where: { name: 'Nutrição' }, update: {}, create: { name: 'Nutrição', color: '#60A5FA' } }),
    db.leadStatus.upsert({
      where: { name: 'Não Qualificado' },
      update: {},
      create: { name: 'Não Qualificado', color: '#EF4444', tmkReasonRequired: true },
    }),
    db.leadStatus.upsert({ where: { name: 'Qualificado' }, update: {}, create: { name: 'Qualificado', color: '#22C55E' } }),
  ])

  const stages = [
    'Negociação',
    'Apresentação Agendada',
    'Proposta Enviada',
    'Trial',
    'Vencimento Trial',
    'Venda Ganha',
    'Venda Perdida',
  ]

  await Promise.all(
    stages.map((name, order) =>
      db.opportunityStage.upsert({
        where: { name },
        update: {},
        create: { name, order, lostReasonRequired: name === 'Venda Perdida' },
      })
    )
  )

  const internalItems = [
    { sku: 'PLAN_BASE_STD', name: 'Plano Base (3 usuários + 1 WhatsApp)', price: 219.9, channel: Channel.INTERNAL, kind: ItemKind.PLAN },
    { sku: 'PLAN_BASE_WABA_STD', name: 'Plano Base API Oficial WhatsApp (3 + 1 Oficial)', price: 219.9, channel: Channel.INTERNAL, kind: ItemKind.PLAN },
    { sku: 'ADD_USER', name: 'Usuário Adicional', price: 39.9, channel: Channel.INTERNAL, kind: ItemKind.ADDON },
    { sku: 'ADD_WHATSAPP', name: 'WhatsApp Adicional', price: 99.9, channel: Channel.INTERNAL, kind: ItemKind.ADDON },
    { sku: 'MOD_CAMPAIGN', name: 'Módulo Campanha', price: 89.9, channel: Channel.INTERNAL, kind: ItemKind.MODULE },
    { sku: 'MOD_FB_MESSENGER', name: 'Messenger Facebook', price: 49.9, channel: Channel.INTERNAL, kind: ItemKind.MODULE },
    { sku: 'MOD_IG_DIRECT', name: 'Direct Instagram', price: 49.9, channel: Channel.INTERNAL, kind: ItemKind.MODULE },
    { sku: 'MOD_WABA', name: 'WABA', price: 199.9, channel: Channel.INTERNAL, kind: ItemKind.MODULE },
  ]

  for (const item of internalItems) {
    await db.priceItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: item,
    })
  }

  const whiteLabelItems = [
    { sku: 'WL_PLAN_BASE_WAPP', name: 'WL Plano Base WhatsApp (3U+1W+1IG+1FB)', price: 179.9, channel: Channel.WHITE_LABEL, kind: ItemKind.PLAN },
    { sku: 'WL_PLAN_BASE_WABA', name: 'WL Plano Base WhatsApp Oficial (3U+1W Oficial+1IG+1FB)', price: 269.9, channel: Channel.WHITE_LABEL, kind: ItemKind.PLAN },
    { sku: 'WL_ADD_WAPP', name: 'WL WhatsApp Adicional', price: 65.9, channel: Channel.WHITE_LABEL, kind: ItemKind.ADDON },
    { sku: 'WL_MOD_CAMPAIGN', name: 'WL Módulo Campanha', price: 0, channel: Channel.WHITE_LABEL, kind: ItemKind.MODULE },
    { sku: 'WL_FB_MESSENGER', name: 'WL Messenger Facebook', price: 29.9, channel: Channel.WHITE_LABEL, kind: ItemKind.MODULE },
    { sku: 'WL_IG_DIRECT', name: 'WL Direct Instagram', price: 29.9, channel: Channel.WHITE_LABEL, kind: ItemKind.MODULE },
    { sku: 'WL_WABA', name: 'WL WABA', price: 99.9, channel: Channel.WHITE_LABEL, kind: ItemKind.MODULE },
  ]

  for (const item of whiteLabelItems) {
    await db.priceItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: item,
    })
  }

  const tiers = [
    { channel: Channel.WHITE_LABEL, minUsers: 1, maxUsers: 19, pricePerUser: 26.9 },
    { channel: Channel.WHITE_LABEL, minUsers: 20, maxUsers: 39, pricePerUser: 20.9 },
    { channel: Channel.WHITE_LABEL, minUsers: 40, maxUsers: 79, pricePerUser: 17.9 },
    { channel: Channel.WHITE_LABEL, minUsers: 80, maxUsers: null, pricePerUser: 13.9 },
  ]

  for (const tier of tiers) {
    await db.priceTier.upsert({
      where: {
        channel_minUsers: {
          channel: tier.channel,
          minUsers: tier.minUsers,
        },
      },
      update: {
        maxUsers: tier.maxUsers,
        pricePerUser: tier.pricePerUser,
      },
      create: tier,
    })
  }

  await Promise.all([
    db.discountPolicy.upsert({ where: { role: Role.SELLER }, update: {}, create: { role: Role.SELLER, maxPercent: 15 } }),
    db.discountPolicy.upsert({ where: { role: Role.FINANCE_NOAH }, update: {}, create: { role: Role.FINANCE_NOAH, maxPercent: 25 } }),
    db.discountPolicy.upsert({ where: { role: Role.ADMIN_NOAH }, update: {}, create: { role: Role.ADMIN_NOAH, maxPercent: 100 } }),
  ])

  const name = (process.env.ADMIN_NAME || 'Administrator').trim()
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!'

  if (!email) {
    throw new Error('ADMIN_EMAIL must be provided for the seed.')
  }
  if (!password) {
    throw new Error('ADMIN_PASSWORD must be provided for the seed.')
  }

  const hash = await bcrypt.hash(password, 10)

  await db.user.upsert({
    where: { email },
    update: { passwordHash: hash, role: Role.ADMIN_NOAH, name },
    create: { email, passwordHash: hash, role: Role.ADMIN_NOAH, name },
  })

  console.log(`Admin user ensured: ${email}`)

  console.log('Seed concluído ✅')
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
