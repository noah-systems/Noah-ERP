import { Injectable } from '@nestjs/common';
import { PartnerAccountStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  CreateChangeRequestDto,
  CreatePartnerAccountDto,
  CreatePartnerDto,
  ResolveChangeDto,
} from './partner.dto';

@Injectable()
export class PartnerService {
  constructor(private readonly prisma: PrismaService) {}

  createPartner(dto: CreatePartnerDto) {
    return this.prisma.partner.create({
      data: {
        legalName: dto.legalName,
        cnpj: dto.cnpj,
        nickname: dto.nickname,
        address: dto.address ?? null,
        contact: dto.contact ?? null,
        whatsapp: dto.whatsapp ?? null,
        financeEmail: dto.financeEmail ?? null,
        domain: dto.domain ?? null,
        priceTable: dto.priceTable ?? Prisma.JsonNull,
      },
    });
  }

  createAccount(partnerId: string, dto: CreatePartnerAccountDto) {
    return this.prisma.partnerAccount.create({
      data: {
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
        connections: dto.connections ?? Prisma.JsonNull,
        modules: dto.modules ?? Prisma.JsonNull,
        status: PartnerAccountStatus.PENDING_CREATE,
      },
    });
  }

  requestChange(accountId: string, dto: CreateChangeRequestDto) {
    return this.prisma.partnerChangeRequest.create({
      data: {
        accountId,
        type: dto.type,
        payload: dto.payload ?? Prisma.JsonNull,
      },
    });
  }

  resolveChange(accountId: string, dto: ResolveChangeDto) {
    return this.prisma.partnerAccount.update({
      where: { id: accountId },
      data: {
        status: dto.status,
        note: dto.note ?? null,
      },
    });
  }
}
