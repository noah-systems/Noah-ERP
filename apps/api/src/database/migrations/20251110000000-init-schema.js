'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;
    const { QueryTypes } = Sequelize;

    async function tableExists(table, transaction) {
      const [rows] = await sequelize.query(
        'SELECT to_regclass(:table) AS table_name',
        { replacements: { table: `public.${table}` }, transaction },
      );
      return Array.isArray(rows) && rows.length > 0 && rows[0].table_name !== null;
    }

    async function createEnum(name, values, transaction) {
      const exists = await sequelize.query(
        'SELECT 1 FROM pg_type WHERE typname = :name',
        { replacements: { name }, type: QueryTypes.SELECT, transaction },
      );
      if (exists.length === 0) {
        await sequelize.query(
          `CREATE TYPE "${name}" AS ENUM (${values.map((value) => `'${value}'`).join(', ')})`,
          { transaction },
        );
      }
    }

    async function ensureIndex(table, indexName, definitionSql, transaction) {
      const records = await sequelize.query(
        'SELECT to_regclass(:name) AS index_name',
        { replacements: { name: indexName }, type: QueryTypes.SELECT, transaction },
      );
      const record = records[0];
      if (!record || record.index_name === null) {
        await sequelize.query(definitionSql, { transaction });
      }
    }

    await sequelize.transaction(async (transaction) => {
      await sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"', { transaction });

      await sequelize.query(
        'CREATE TABLE IF NOT EXISTS "SequelizeMeta" (name VARCHAR(255) PRIMARY KEY)',
        { transaction },
      );

      await createEnum(
        'enum_users_role',
        [
          'ADMIN_NOAH',
          'SUPPORT_NOAH',
          'FINANCE_NOAH',
          'SELLER',
          'PARTNER_MASTER',
          'PARTNER_OPS',
          'PARTNER_FINANCE',
        ],
        transaction,
      );

      if (!(await tableExists('users', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS "users" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role "enum_users_role" NOT NULL DEFAULT 'SELLER',
            partner_id UUID NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          )`,
          { transaction },
        );
      } else {
        await sequelize.query(
          'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS partner_id UUID NULL',
          { transaction },
        );
        await sequelize.query(
          "ALTER TABLE \"users\" ADD COLUMN IF NOT EXISTS role \"enum_users_role\" NOT NULL DEFAULT 'SELLER'",
          { transaction },
        );
      }

      await ensureIndex(
        'users',
        'users_email_idx',
        'CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON "users" (email)',
        transaction,
      );

      await createEnum('enum_leads_status', ['NURTURING', 'QUALIFIED', 'DISQUALIFIED'], transaction);

      if (!(await tableExists('lead_statuses', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS lead_statuses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL UNIQUE,
            color TEXT NOT NULL DEFAULT '#000000',
            tmk_reason_required BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          )`,
          { transaction },
        );
      }

      if (!(await tableExists('leads', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS leads (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_name TEXT NOT NULL,
            segment TEXT NULL,
            employees_count INTEGER NULL,
            contact_name TEXT NULL,
            phone TEXT NULL,
            email TEXT NULL,
            source TEXT NULL,
            status "enum_leads_status" NOT NULL DEFAULT 'NURTURING',
            status_id UUID NULL REFERENCES lead_statuses(id) ON UPDATE CASCADE ON DELETE SET NULL,
            owner_id UUID NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
            notes TEXT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          )`,
          { transaction },
        );
      } else {
        await sequelize.query(
          "ALTER TABLE leads ADD COLUMN IF NOT EXISTS status \"enum_leads_status\" NOT NULL DEFAULT 'NURTURING'",
          { transaction },
        );
        await sequelize.query(
          'ALTER TABLE leads ADD COLUMN IF NOT EXISTS status_id UUID NULL REFERENCES lead_statuses(id) ON UPDATE CASCADE ON DELETE SET NULL',
          { transaction },
        );
        await sequelize.query(
          'ALTER TABLE leads ADD COLUMN IF NOT EXISTS owner_id UUID NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL',
          { transaction },
        );
      }

      await ensureIndex(
        'leads',
        'leads_status_idx',
        'CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status)',
        transaction,
      );
      await ensureIndex(
        'leads',
        'leads_company_name_idx',
        'CREATE INDEX IF NOT EXISTS leads_company_name_idx ON leads (company_name)',
        transaction,
      );

      if (!(await tableExists('opportunity_stages', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS opportunity_stages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL UNIQUE,
            "order" INTEGER NOT NULL DEFAULT 0,
            lost_reason_required BOOLEAN NOT NULL DEFAULT FALSE
          )`,
          { transaction },
        );
      }

      if (!(await tableExists('hosting_providers', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS hosting_providers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL
          )`,
          { transaction },
        );
      }

      await createEnum(
        'enum_opportunities_stage',
        ['NEGOTIATION', 'PRESENTATION', 'PROPOSAL', 'TRIAL', 'TRIAL_EXPIRING', 'WON', 'LOST'],
        transaction,
      );

      if (!(await tableExists('opportunities', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS opportunities (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_name TEXT NOT NULL,
            cnpj TEXT NULL,
            contact_name TEXT NOT NULL,
            contact_email TEXT NULL,
            contact_phone TEXT NULL,
            finance_email TEXT NULL,
            finance_phone TEXT NULL,
            subdomain TEXT NULL,
            amount NUMERIC(12,2) NOT NULL DEFAULT 0,
            stage "enum_opportunities_stage" NOT NULL DEFAULT 'NEGOTIATION',
            trial_ends_at TIMESTAMP WITH TIME ZONE NULL,
            owner_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
            lead_id UUID NULL REFERENCES leads(id) ON UPDATE CASCADE ON DELETE SET NULL,
            stage_id UUID NULL REFERENCES opportunity_stages(id) ON UPDATE CASCADE ON DELETE SET NULL,
            hosting_id UUID NULL REFERENCES hosting_providers(id) ON UPDATE CASCADE ON DELETE SET NULL,
            tags JSONB NOT NULL DEFAULT '[]'::jsonb,
            lost_reason TEXT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          )`,
          { transaction },
        );
      } else {
        await sequelize.query(
          'ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS lead_id UUID NULL REFERENCES leads(id) ON UPDATE CASCADE ON DELETE SET NULL',
          { transaction },
        );
        await sequelize.query(
          'ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS stage_id UUID NULL REFERENCES opportunity_stages(id) ON UPDATE CASCADE ON DELETE SET NULL',
          { transaction },
        );
        await sequelize.query(
          'ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS hosting_id UUID NULL REFERENCES hosting_providers(id) ON UPDATE CASCADE ON DELETE SET NULL',
          { transaction },
        );
      }

      await ensureIndex(
        'opportunities',
        'opportunities_stage_idx',
        'CREATE INDEX IF NOT EXISTS opportunities_stage_idx ON opportunities (stage)',
        transaction,
      );
      await ensureIndex(
        'opportunities',
        'opportunities_company_idx',
        'CREATE INDEX IF NOT EXISTS opportunities_company_idx ON opportunities (company_name)',
        transaction,
      );
      await ensureIndex(
        'opportunities',
        'opportunities_owner_idx',
        'CREATE INDEX IF NOT EXISTS opportunities_owner_idx ON opportunities (owner_id)',
        transaction,
      );

      if (!(await tableExists('opportunity_history', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS opportunity_history (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            opp_id UUID NOT NULL REFERENCES opportunities(id) ON UPDATE CASCADE ON DELETE CASCADE,
            actor_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
            from_stage_id UUID NULL REFERENCES opportunity_stages(id) ON UPDATE CASCADE ON DELETE SET NULL,
            to_stage_id UUID NULL REFERENCES opportunity_stages(id) ON UPDATE CASCADE ON DELETE SET NULL,
            note TEXT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          )`,
          { transaction },
        );
      }

      await ensureIndex(
        'opportunity_history',
        'opportunity_history_opp_idx',
        'CREATE INDEX IF NOT EXISTS opportunity_history_opp_idx ON opportunity_history (opp_id)',
        transaction,
      );

      if (!(await tableExists('canceled_sales', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS canceled_sales (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            opp_id UUID NOT NULL UNIQUE REFERENCES opportunities(id) ON UPDATE CASCADE ON DELETE CASCADE,
            reason TEXT NULL,
            summary TEXT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          )`,
          { transaction },
        );
      }

      if (!(await tableExists('partners', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS partners (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nickname TEXT NOT NULL,
            legal_name TEXT NOT NULL,
            cnpj TEXT NOT NULL,
            address TEXT NULL,
            domain TEXT NULL,
            contact TEXT NULL,
            whatsapp TEXT NULL,
            finance_email TEXT NULL,
            price_table JSONB NULL
          )`,
          { transaction },
        );
      }

      await createEnum(
        'enum_partner_accounts_status',
        ['PENDING_CREATE', 'ACTIVE', 'PENDING_CHANGE', 'CANCELED'],
        transaction,
      );

      if (!(await tableExists('partner_accounts', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS partner_accounts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            partner_id UUID NOT NULL REFERENCES partners(id) ON UPDATE CASCADE ON DELETE CASCADE,
            legal_name TEXT NOT NULL,
            cnpj TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NULL,
            subdomain TEXT NULL,
            users INTEGER NULL,
            hosting_id UUID NULL REFERENCES hosting_providers(id) ON UPDATE CASCADE ON DELETE SET NULL,
            server_ip TEXT NULL,
            billing_base_day INTEGER NULL,
            connections JSONB NULL,
            modules JSONB NULL,
            status "enum_partner_accounts_status" NOT NULL DEFAULT 'PENDING_CREATE',
            note TEXT NULL,
            activated_at TIMESTAMP WITH TIME ZONE NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          )`,
          { transaction },
        );
      }

      if (!(await tableExists('partner_change_requests', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS partner_change_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            account_id UUID NOT NULL REFERENCES partner_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE,
            type TEXT NOT NULL,
            payload JSONB NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          )`,
          { transaction },
        );
      }

      await createEnum('enum_price_items_channel', ['INTERNAL', 'WHITE_LABEL'], transaction);
      await createEnum('enum_price_items_kind', ['PLAN', 'ADDON', 'MODULE'], transaction);

      if (!(await tableExists('price_items', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS price_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            sku TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            price NUMERIC(10,2) NOT NULL,
            channel "enum_price_items_channel" NOT NULL,
            kind "enum_price_items_kind" NOT NULL,
            active BOOLEAN NOT NULL DEFAULT TRUE
          )`,
          { transaction },
        );
      }

      if (!(await tableExists('price_tiers', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS price_tiers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            channel "enum_price_items_channel" NOT NULL,
            min_users INTEGER NOT NULL,
            max_users INTEGER NULL,
            price_per_user NUMERIC(10,2) NOT NULL
          )`,
          { transaction },
        );
      }

      await createEnum(
        'enum_discount_policies_role',
        [
          'ADMIN_NOAH',
          'SUPPORT_NOAH',
          'FINANCE_NOAH',
          'SELLER',
          'PARTNER_MASTER',
          'PARTNER_OPS',
          'PARTNER_FINANCE',
        ],
        transaction,
      );

      if (!(await tableExists('discount_policies', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS discount_policies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role "enum_discount_policies_role" NOT NULL UNIQUE,
            max_percent NUMERIC(5,2) NOT NULL
          )`,
          { transaction },
        );
      }

      await createEnum(
        'enum_implementation_tasks_status',
        ['PENDING', 'SCHEDULED', 'DONE', 'UNSUCCESSFUL'],
        transaction,
      );

      if (!(await tableExists('implementation_tasks', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS implementation_tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            account_id UUID NOT NULL REFERENCES partner_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE,
            domain TEXT NOT NULL,
            segment TEXT NULL,
            status "enum_implementation_tasks_status" NOT NULL DEFAULT 'PENDING',
            assignee_id UUID NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
            scheduled_at TIMESTAMP WITH TIME ZONE NULL,
            notes TEXT NULL,
            position INTEGER NOT NULL DEFAULT 0,
            created_by_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          )`,
          { transaction },
        );
      }

      await ensureIndex(
        'implementation_tasks',
        'implementation_tasks_status_idx',
        'CREATE INDEX IF NOT EXISTS implementation_tasks_status_idx ON implementation_tasks (status)',
        transaction,
      );
      await ensureIndex(
        'implementation_tasks',
        'implementation_tasks_assignee_idx',
        'CREATE INDEX IF NOT EXISTS implementation_tasks_assignee_idx ON implementation_tasks (assignee_id)',
        transaction,
      );

      await createEnum(
        'enum_implementation_events_type',
        ['SCHEDULED', 'DONE', 'UNSUCCESSFUL', 'COMMENT'],
        transaction,
      );

      if (!(await tableExists('implementation_events', transaction))) {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS implementation_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            task_id UUID NOT NULL REFERENCES implementation_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE,
            type "enum_implementation_events_type" NOT NULL,
            payload JSONB NULL,
            created_by_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          )`,
          { transaction },
        );
      }

      await ensureIndex(
        'implementation_events',
        'implementation_events_task_idx',
        'CREATE INDEX IF NOT EXISTS implementation_events_task_idx ON implementation_events (task_id)',
        transaction,
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS "SequelizeMeta" CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS implementation_events CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS implementation_tasks CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS discount_policies CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS price_tiers CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS price_items CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS partner_change_requests CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS partner_accounts CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS partners CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS canceled_sales CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS opportunity_history CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS opportunities CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS hosting_providers CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS opportunity_stages CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS leads CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS lead_statuses CASCADE', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS users CASCADE', { transaction });

      const dropType = async (name) => {
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${name}"`, { transaction });
      };

      await dropType('enum_implementation_events_type');
      await dropType('enum_implementation_tasks_status');
      await dropType('enum_discount_policies_role');
      await dropType('enum_price_items_kind');
      await dropType('enum_price_items_channel');
      await dropType('enum_partner_accounts_status');
      await dropType('enum_opportunities_stage');
      await dropType('enum_leads_status');
      await dropType('enum_users_role');
    });
  },
};
