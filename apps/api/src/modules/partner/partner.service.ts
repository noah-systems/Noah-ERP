import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

type ModuleFlags = { campaign?: boolean; crm?: boolean; voip?: boolean; glpi?: boolean };
type CreatePartnerDto = { legalName: string; cnpj: string; nickname: string; address?: string; contact?: string; whatsapp?: string; financeEmail?: string; domain?: string; priceTable?: Record<string, unknown>; };
type CreatePartnerAccountDto = { legalName: string; cnpj: string; email: string; phone?: string; subdomain?: string; users?: number; connections?: Record<string, unknown>; modules?: ModuleFlags; hostingId?: string; serverIp?: string; billingBaseDay?: number; };
type CreateChangeRequestDto = { type: string; payload?: Record<string, unknown>; };
type ResolveChangeDto = { status: 'PENDING_CREATE' | 'ACTIVE' | 'PENDING_CHANGE' | 'CANCELED'; note?: string; };

@Injectable()
export class PartnerService {
  constructor(private readonly db: PrismaService) {}

  create(dto: CreatePartnerDto) {
    return this.db.partner.create({
      data: {
        legalName: dto.legalName, cnpj: dto.cnpj, nickname: dto.nickname,
        address: dto.address ?? '', contact: dto.contact ?? '', whatsapp: dto.whatsapp ?? '',
        financeEmail: dto.financeEmail ?? '', domain: dto.domain ?? '', priceTable: dto.priceTable ?? {},
      },
    });
  }

  createAccount(partnerId: string, dto: CreatePartnerAccountDto) {
    return this.db.partnerAccount.create({
      data: {
        partnerId, legalName: dto.legalName, cnpj: dto.cnpj, email: dto.email, phone: dto.phone ?? '',
        subdomain: dto.subdomain ?? '', users: dto.users ?? 0, hostingId: dto.hostingId ?? null, serverIp: dto.serverIp ?? null,
        billingBaseDay: dto.billingBaseDay ?? null, connections: dto.connections ?? {}, modules: dto.modules ?? {}, status: 'PENDING_CREATE',
      },
    });
  }

  async requestChange(accountId: string, dto: CreateChangeRequestDto) {
    await this.db.partnerChangeRequest.create({ data: { accountId, type: dto.type, payload: dto.payload ?? {} } }).catch(() => {});
    return { ok: true };
  }

  async resolveChange(accountId: string, dto: ResolveChangeDto) {
    await this.db.partnerAccount.update({ where: { id: accountId }, data: { status: dto.status as any, note: dto.note ?? undefined } as any }).catch(() => {});
    return { ok: true };
  }
}
