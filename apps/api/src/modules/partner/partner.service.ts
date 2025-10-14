import { Injectable, NotFoundException } from '@nestjs/common';
import { PartnerAccountStatus } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  CreateChangeRequestDto,
  CreatePartnerAccountDto,
  CreatePartnerDto,
  ResolveChangeDto,
} from './partner.dto';

@Injectable()
export class PartnerService {
  constructor(private readonly db: PrismaService) {}

  createPartner(dto: CreatePartnerDto) {
    return this.db.partner.create({
      data: {
        legalName: dto.legalName,
        cnpj: dto.cnpj,
        nickname: dto.nickname,
        address: dto.address,
        contact: dto.contact,
        whatsapp: dto.whatsapp,
        financeEmail: dto.financeEmail,
        domain: dto.domain,
        priceTable: dto.priceTable ?? null,
      },
    });
  }

  async createAccount(partnerId: string, dto: CreatePartnerAccountDto) {
    return this.db.$transaction(async (tx) => {
      const partner = await tx.partner.findUnique({ where: { id: partnerId } });
      if (!partner) throw new NotFoundException('partner');
      const modules = {
        campaign: dto.modules?.campaign ?? false,
        crm: dto.modules?.crm ?? false,
        voip: dto.modules?.voip ?? false,
        glpi: dto.modules?.glpi ?? false,
      };
      const account = await tx.partnerAccount.create({
        data: {
          partnerId,
          legalName: dto.legalName,
          cnpj: dto.cnpj,
          email: dto.email,
          phone: dto.phone,
          subdomain: dto.subdomain,
          users: dto.users,
          connections: dto.connections ?? null,
          modules,
          hostingId: dto.hostingId,
          serverIp: dto.serverIp,
          billingBaseDay: dto.billingBaseDay,
          status: PartnerAccountStatus.PENDING_CREATE,
        },
      });
      await tx.partnerAccountEvent.create({
        data: {
          accountId: account.id,
          type: 'ACCOUNT_CREATED',
          payload: null,
        },
      });
      return account;
    });
  }

  async requestChange(accountId: string, dto: CreateChangeRequestDto) {
    return this.db.$transaction(async (tx) => {
      const account = await tx.partnerAccount.findUnique({ where: { id: accountId } });
      if (!account) throw new NotFoundException('account');
      const updated = await tx.partnerAccount.update({
        where: { id: accountId },
        data: { status: PartnerAccountStatus.PENDING_CHANGE },
      });
      await tx.partnerAccountEvent.create({
        data: {
          accountId,
          type: dto.type,
          payload: dto.payload ?? null,
        },
      });
      return updated;
    });
  }

  async resolveChange(accountId: string, dto: ResolveChangeDto) {
    return this.db.$transaction(async (tx) => {
      const account = await tx.partnerAccount.findUnique({ where: { id: accountId } });
      if (!account) throw new NotFoundException('account');
      const updated = await tx.partnerAccount.update({
        where: { id: accountId },
        data: { status: dto.status },
      });
      await tx.partnerAccountEvent.create({
        data: {
          accountId,
          type: 'CHANGE_RESOLVED',
          payload: dto.note ? { note: dto.note } : null,
        },
      });
      return updated;
    });
  }
}
