import { Injectable } from '@nestjs/common';
import { PartnerAccountStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateChangeRequestDto,
  CreatePartnerAccountDto,
  CreatePartnerDto,
  ResolveChangeDto,
} from './partner.dto';

const toJsonInput = (
  value?: unknown
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput => {
  if (value === undefined || value === null) {
    return Prisma.JsonNull;
  }
  return value as Prisma.InputJsonValue;
};

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
        priceTable: toJsonInput(dto.priceTable ? { ...dto.priceTable } : undefined),
      },
    });
  }

  createAccount(partnerId: string, dto: CreatePartnerAccountDto) {
    const connections = dto.connections ? { ...dto.connections } : undefined;
    const modules = dto.modules ? { ...dto.modules } : undefined;
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
        connections: toJsonInput(connections),
        modules: toJsonInput(modules),
        status: PartnerAccountStatus.PENDING_CREATE,
      },
    });
  }

  requestChange(accountId: string, dto: CreateChangeRequestDto) {
    return this.prisma.partnerChangeRequest.create({
      data: {
        accountId,
        type: dto.type,
        payload: toJsonInput(dto.payload ? { ...dto.payload } : undefined),
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
