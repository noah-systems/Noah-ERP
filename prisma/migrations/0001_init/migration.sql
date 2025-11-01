-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN_NOAH', 'SUPPORT_NOAH', 'FINANCE_NOAH', 'SELLER', 'PARTNER_MASTER', 'PARTNER_FINANCE', 'PARTNER_OPS');

-- CreateEnum
CREATE TYPE "ImplStatus" AS ENUM ('PENDING_SCHED', 'SCHEDULED', 'DONE', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('INTERNAL', 'WHITE_LABEL');

-- CreateEnum
CREATE TYPE "ItemKind" AS ENUM ('PLAN', 'ADDON', 'MODULE');

-- CreateEnum
CREATE TYPE "PartnerAccountStatus" AS ENUM ('PENDING_CREATE', 'ACTIVE', 'PENDING_CHANGE', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SELLER',
    "partnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "tmkReasonRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "segment" TEXT,
    "headcount" INTEGER DEFAULT 0,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "statusId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityStage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "lostReasonRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OpportunityStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostingProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "HostingProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "leadId" TEXT,
    "stageId" TEXT NOT NULL,
    "hostingId" TEXT,
    "legalName" TEXT,
    "cnpj" TEXT,
    "address" TEXT,
    "subdomain" TEXT,
    "users" INTEGER NOT NULL DEFAULT 0,
    "whatsapp" INTEGER NOT NULL DEFAULT 0,
    "instagram" INTEGER NOT NULL DEFAULT 0,
    "facebook" INTEGER NOT NULL DEFAULT 0,
    "waba" INTEGER NOT NULL DEFAULT 0,
    "serverIp" TEXT,
    "trialStart" TIMESTAMP(3),
    "activation" TIMESTAMP(3),
    "billingBaseDay" INTEGER,
    "priceTotal" DECIMAL(10,2),
    "priceMonthly" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OppHistory" (
    "id" TEXT NOT NULL,
    "oppId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStageId" TEXT,
    "toStageId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OppHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImplementationTask" (
    "id" TEXT NOT NULL,
    "oppId" TEXT NOT NULL,
    "status" "ImplStatus" NOT NULL DEFAULT 'PENDING_SCHED',
    "schedule" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImplementationTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanceledSale" (
    "id" TEXT NOT NULL,
    "oppId" TEXT NOT NULL,
    "reason" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanceledSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "address" TEXT,
    "domain" TEXT,
    "contact" TEXT,
    "whatsapp" TEXT,
    "financeEmail" TEXT,
    "priceTable" JSONB,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerAccount" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subdomain" TEXT,
    "users" INTEGER,
    "hostingId" TEXT,
    "serverIp" TEXT,
    "billingBaseDay" INTEGER,
    "connections" JSONB,
    "modules" JSONB,
    "status" "PartnerAccountStatus" NOT NULL DEFAULT 'PENDING_CREATE',
    "note" TEXT,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerChangeRequest" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceItem" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "channel" "Channel" NOT NULL,
    "kind" "ItemKind" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PriceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceTier" (
    "id" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "minUsers" INTEGER NOT NULL,
    "maxUsers" INTEGER,
    "pricePerUser" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PriceTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountPolicy" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "maxPercent" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "DiscountPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LeadStatus_name_key" ON "LeadStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OpportunityStage_name_key" ON "OpportunityStage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CanceledSale_oppId_key" ON "CanceledSale"("oppId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceItem_sku_key" ON "PriceItem"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "PriceTier_channel_minUsers_key" ON "PriceTier"("channel", "minUsers");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountPolicy_role_key" ON "DiscountPolicy"("role");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "LeadStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "OpportunityStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_hostingId_fkey" FOREIGN KEY ("hostingId") REFERENCES "HostingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OppHistory" ADD CONSTRAINT "OppHistory_oppId_fkey" FOREIGN KEY ("oppId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OppHistory" ADD CONSTRAINT "OppHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OppHistory" ADD CONSTRAINT "OppHistory_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "OpportunityStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OppHistory" ADD CONSTRAINT "OppHistory_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "OpportunityStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImplementationTask" ADD CONSTRAINT "ImplementationTask_oppId_fkey" FOREIGN KEY ("oppId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanceledSale" ADD CONSTRAINT "CanceledSale_oppId_fkey" FOREIGN KEY ("oppId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerAccount" ADD CONSTRAINT "PartnerAccount_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerAccount" ADD CONSTRAINT "PartnerAccount_hostingId_fkey" FOREIGN KEY ("hostingId") REFERENCES "HostingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerChangeRequest" ADD CONSTRAINT "PartnerChangeRequest_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PartnerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

