declare module '@prisma/client' {
  export type Role =
    | 'ADMIN_NOAH'
    | 'SUPPORT_NOAH'
    | 'FINANCE_NOAH'
    | 'SELLER'
    | 'PARTNER_MASTER'
    | 'PARTNER_FINANCE'
    | 'PARTNER_OPS';
  export const Role: {
    ADMIN_NOAH: Role;
    SUPPORT_NOAH: Role;
    FINANCE_NOAH: Role;
    SELLER: Role;
    PARTNER_MASTER: Role;
    PARTNER_FINANCE: Role;
    PARTNER_OPS: Role;
  };

  export type ImplStatus = 'PENDING_SCHED' | 'SCHEDULED' | 'DONE' | 'NO_SHOW';
  export const ImplStatus: {
    PENDING_SCHED: ImplStatus;
    SCHEDULED: ImplStatus;
    DONE: ImplStatus;
    NO_SHOW: ImplStatus;
  };
  export type Channel = 'INTERNAL' | 'WHITE_LABEL';
  export const Channel: {
    INTERNAL: Channel;
    WHITE_LABEL: Channel;
  };
  export type ItemKind = 'PLAN' | 'ADDON' | 'MODULE';
  export const ItemKind: {
    PLAN: ItemKind;
    ADDON: ItemKind;
    MODULE: ItemKind;
  };
  export type PartnerAccountStatus =
    | 'PENDING_CREATE'
    | 'ACTIVE'
    | 'PENDING_CHANGE'
    | 'CANCELED';
  export const PartnerAccountStatus: {
    PENDING_CREATE: PartnerAccountStatus;
    ACTIVE: PartnerAccountStatus;
    PENDING_CHANGE: PartnerAccountStatus;
    CANCELED: PartnerAccountStatus;
  };

  export namespace Prisma {
    class Decimal {
      constructor(value: string | number);
      toNumber(): number;
    }

    type ImplementationTaskUpdateInput = Record<string, unknown>;
    type OpportunityUncheckedCreateInput = Record<string, unknown>;
    type DiscountPolicyWhereUniqueInput = { id?: string; role?: Role };
    type InputJsonValue = unknown;
    type NullableJsonNullValueInput = null;
    const JsonNull: null;

    interface PartnerCreateInput {
      priceTable?: InputJsonValue | NullableJsonNullValueInput;
    }

    interface PartnerAccountCreateInput {
      connections?: InputJsonValue | NullableJsonNullValueInput;
      modules?: InputJsonValue | NullableJsonNullValueInput;
    }

    interface PartnerChangeRequestCreateInput {
      payload?: InputJsonValue | NullableJsonNullValueInput;
    }
  }

  export class PrismaClient {
    $connect(): Promise<void>;
    $transaction<T>(fn: (client: PrismaClient) => Promise<T>): Promise<T>;
    [key: string]: any;
  }
}
