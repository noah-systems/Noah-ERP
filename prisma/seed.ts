import { PrismaClient, Role, Channel, ItemKind } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
const db = new PrismaClient()

async function main() {
  // Lead statuses
  const [nutri, notq, qual] = await Promise.all([
    db.leadStatus.upsert({ where:{name:'Nutrição'}, update:{}, create:{name:'Nutrição', color:'#60A5FA'} }),
    db.leadStatus.upsert({ where:{name:'Não Qualificado'}, update:{}, create:{name:'Não Qualificado', color:'#EF4444', tmkReasonRequired:true} }),
    db.leadStatus.upsert({ where:{name:'Qualificado'}, update:{}, create:{name:'Qualificado', color:'#22C55E'} }),
  ])

  // Opportunity stages
  const stages = ['Negociação','Apresentação Agendada','Proposta Enviada','Trial','Vencimento Trial','Venda Ganha','Venda Perdida']
  await Promise.all(stages.map((name, i) =>
    db.opportunityStage.upsert({
      where: { name },
      update: {},
      create: { name, order: i, lostReasonRequired: name === 'Venda Perdida' }
    })
  ))

  // Pricing INTERNAL (conforme você definiu)
  const internalItems = [
    { sku:'PLAN_BASE_STD', name:'Plano Base (3 usuários + 1 WhatsApp)', price:219.90, channel:Channel.INTERNAL, kind:ItemKind.PLAN },
    { sku:'PLAN_BASE_WABA_STD', name:'Plano Base API Oficial WhatsApp (3 + 1 Oficial)', price:219.90, channel:Channel.INTERNAL, kind:ItemKind.PLAN },
    { sku:'ADD_USER', name:'Usuário Adicional', price:39.90, channel:Channel.INTERNAL, kind:ItemKind.ADDON },
    { sku:'ADD_WHATSAPP', name:'WhatsApp Adicional', price:99.90, channel:Channel.INTERNAL, kind:ItemKind.ADDON },
    { sku:'MOD_CAMPAIGN', name:'Módulo Campanha', price:89.90, channel:Channel.INTERNAL, kind:ItemKind.MODULE },
    { sku:'MOD_FB_MESSENGER', name:'Messenger Facebook', price:49.90, channel:Channel.INTERNAL, kind:ItemKind.MODULE },
    { sku:'MOD_IG_DIRECT', name:'Direct Instagram', price:49.90, channel:Channel.INTERNAL, kind:ItemKind.MODULE },
    { sku:'MOD_WABA', name:'WABA', price:199.90, channel:Channel.INTERNAL, kind:ItemKind.MODULE },
  ]
  for (const it of internalItems) {
    await db.priceItem.upsert({ where:{sku:it.sku}, update:{}, create:it as any })
  }

  // Pricing WHITE LABEL
  const wlItems = [
    { sku:'WL_PLAN_BASE_WAPP', name:'WL Plano Base WhatsApp (3U+1W+1IG+1FB)', price:179.90, channel:Channel.WHITE_LABEL, kind:ItemKind.PLAN },
    { sku:'WL_PLAN_BASE_WABA', name:'WL Plano Base WhatsApp Oficial (3U+1W Oficial+1IG+1FB)', price:269.90, channel:Channel.WHITE_LABEL, kind:ItemKind.PLAN },
    { sku:'WL_ADD_WAPP', name:'WL WhatsApp Adicional', price:65.90, channel:Channel.WHITE_LABEL, kind:ItemKind.ADDON },
    { sku:'WL_MOD_CAMPAIGN', name:'WL Módulo Campanha', price:0.00, channel:Channel.WHITE_LABEL, kind:ItemKind.MODULE },
    { sku:'WL_FB_MESSENGER', name:'WL Messenger Facebook', price:29.90, channel:Channel.WHITE_LABEL, kind:ItemKind.MODULE },
    { sku:'WL_IG_DIRECT', name:'WL Direct Instagram', price:29.90, channel:Channel.WHITE_LABEL, kind:ItemKind.MODULE },
    { sku:'WL_WABA', name:'WL WABA', price:99.90, channel:Channel.WHITE_LABEL, kind:ItemKind.MODULE },
  ]
  for (const it of wlItems) {
    await db.priceItem.upsert({ where:{sku:it.sku}, update:{}, create:it as any })
  }

  // Tiers WL (usuário adicional por total)
  const tiers = [
    { channel:Channel.WHITE_LABEL, minUsers:1,  maxUsers:19,  pricePerUser:26.90 },
    { channel:Channel.WHITE_LABEL, minUsers:20, maxUsers:39,  pricePerUser:20.90 },
    { channel:Channel.WHITE_LABEL, minUsers:40, maxUsers:79,  pricePerUser:17.90 },
    { channel:Channel.WHITE_LABEL, minUsers:80, maxUsers:null, pricePerUser:13.90 },
  ]
  for (const t of tiers) {
    await db.priceTier.create({ data: t as any })
  }

  // DiscountPolicy (INTERNAL apenas)
  await Promise.all([
    db.discountPolicy.upsert({ where:{role:Role.SELLER}, update:{}, create:{ role:Role.SELLER, maxPercent:15 } }),
    db.discountPolicy.upsert({ where:{role:Role.FINANCE_NOAH}, update:{}, create:{ role:Role.FINANCE_NOAH, maxPercent:25 } }),
    db.discountPolicy.upsert({ where:{role:Role.ADMIN_NOAH}, update:{}, create:{ role:Role.ADMIN_NOAH, maxPercent:100 } }),
  ])

  // Usuário MASTER
  const name = process.env.MASTER_NAME || 'Admin Noah'
  const email = process.env.MASTER_EMAIL || 'admin@noahomni.com.br'
  const password = process.env.MASTER_PASSWORD || 'TroqueEstaSenha'
  const hash = await bcrypt.hash(password, 10)
  await db.user.upsert({
    where: { email },
    update: { passwordHash: hash, role: Role.ADMIN_NOAH, name },
    create: { email, passwordHash: hash, role: Role.ADMIN_NOAH, name },
  })

  console.log('Seed concluído ✅')
}

main().finally(() => db.$disconnect())
