import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PartnerAccountStatus } from '../../database/enums.js';
import { Partner } from '../../database/models/partner.model.js';
import { PartnerAccount } from '../../database/models/partner-account.model.js';
import { PartnerChangeRequest } from '../../database/models/partner-change-request.model.js';
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
  constructor(
    @InjectModel(Partner) private readonly partners: typeof Partner,
    @InjectModel(PartnerAccount) private readonly partnerAccounts: typeof PartnerAccount,
    @InjectModel(PartnerChangeRequest) private readonly partnerChanges: typeof PartnerChangeRequest,
  ) {}

  async createPartner(dto: CreatePartnerDto) {
    const partner = await this.partners.create({
      legalName: dto.legalName,
      cnpj: dto.cnpj,
      nickname: dto.nickname,
      address: dto.address ?? null,
      contact: dto.contact ?? null,
      whatsapp: dto.whatsapp ?? null,
      financeEmail: dto.financeEmail ?? null,
      domain: dto.domain ?? null,
      priceTable: toJsonInput(dto.priceTable ? { ...dto.priceTable } : undefined),
    });
    return partner.toJSON();
  }

  async createAccount(partnerId: string, dto: CreatePartnerAccountDto) {
    const connections = dto.connections ? { ...dto.connections } : undefined;
    const modules = dto.modules ? { ...dto.modules } : undefined;
    const account = await this.partnerAccounts.create({
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
    });
    return account.toJSON();
  }

  async requestChange(accountId: string, dto: CreateChangeRequestDto) {
    const change = await this.partnerChanges.create({
      accountId,
      type: dto.type,
      payload: toJsonInput(dto.payload ? { ...dto.payload } : undefined),
    });
    return change.toJSON();
  }

  async resolveChange(accountId: string, dto: ResolveChangeDto) {
    const account = await this.partnerAccounts.findByPk(accountId);
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
