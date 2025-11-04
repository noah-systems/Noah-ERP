import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { PartnerAccountStatus } from '../../database/enums.js';
import {
  CreateChangeRequestDto,
  CreatePartnerAccountDto,
  CreatePartnerDto,
  ResolveChangeDto,
} from './partner.dto.js';

const toJsonInput = (
  value?: unknown
): Record<string, unknown> | null => {
  if (value === undefined || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
};

@Injectable()
export class PartnerService {
  constructor(private readonly db: DatabaseService) {}

  createPartner(dto: CreatePartnerDto) {
    return this.db.partner.create({
      legalName: dto.legalName,
      cnpj: dto.cnpj,
      nickname: dto.nickname,
      address: dto.address ?? null,
      contact: dto.contact ?? null,
      whatsapp: dto.whatsapp ?? null,
      financeEmail: dto.financeEmail ?? null,
      domain: dto.domain ?? null,
      priceTable: toJsonInput(dto.priceTable ? { ...dto.priceTable } : undefined),
    }).then((partner) => partner.toJSON());
  }

  createAccount(partnerId: string, dto: CreatePartnerAccountDto) {
    const connections = dto.connections ? { ...dto.connections } : undefined;
    const modules = dto.modules ? { ...dto.modules } : undefined;
    return this.db.partnerAccount.create({
      partnerId,
      legalName: dto.legalName,
      cnpj: dto.cnpj,
      email: dto.email,
      phone: dto.phone ?? null,
      subdomain: dto.subdomain,
      users: dto.users,
      hostingId: dto.hostingId ?? null,
      serverIp: dto.serverIp ?? null,
      billingBaseDay: dto.billingBaseDay ?? null,
      connections: toJsonInput(connections),
      modules: toJsonInput(modules),
      status: PartnerAccountStatus.PENDING_CREATE,
    }).then((account) => account.toJSON());
  }

  requestChange(accountId: string, dto: CreateChangeRequestDto) {
    return this.db.partnerChangeRequest
      .create({
        accountId,
        type: dto.type,
        payload: toJsonInput(dto.payload ? { ...dto.payload } : undefined),
      })
      .then((change) => change.toJSON());
  }

  async resolveChange(accountId: string, dto: ResolveChangeDto) {
    const account = await this.db.partnerAccount.findByPk(accountId);
    if (!account) {
      throw new NotFoundException('partnerAccount');
    }

    await account.update({
      status: dto.status,
      note: dto.note ?? null,
    });

    return account.toJSON();
  }
}
