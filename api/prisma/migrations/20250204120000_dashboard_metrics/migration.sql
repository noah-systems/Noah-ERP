-- Create dashboard metrics table for aggregate counters
CREATE TABLE IF NOT EXISTS "dashboard_metrics" (
  "id" INTEGER NOT NULL,
  "leads" INTEGER NOT NULL DEFAULT 0,
  "opportunities" INTEGER NOT NULL DEFAULT 0,
  "implantation" INTEGER NOT NULL DEFAULT 0,
  "canceled" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "dashboard_metrics_pkey" PRIMARY KEY ("id")
);

-- Align user role default with application roles
ALTER TABLE "User"
  ALTER COLUMN "role" SET DEFAULT 'ADMIN_NOAH';
