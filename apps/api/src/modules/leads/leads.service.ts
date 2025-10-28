import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateLeadDto, UpdateLeadStatusDto } from './leads.dto.js';

@Injectable()
export class LeadsService {
  constructor(private readonly db: PrismaService) {}

  list() {
    return this.db.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        status: true,
        owner: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async create(dto: CreateLeadDto) {
    return this.db.$transaction(async (tx) => {
      const [status, owner] = await Promise.all([
        tx.leadStatus.findUnique({ where: { id: dto.statusId } }),
        tx.user.findUnique({ where: { id: dto.ownerId } }),
      ]);
      if (!status) {
        throw new NotFoundException('status');
      }
      if (!owner) {
        throw new NotFoundException('owner');
      }
      return tx.lead.create({
        data: {
          company: dto.company,
          segment: dto.segment ?? null,
          headcount: dto.headcount ?? undefined,
          contact: dto.contact ?? null,
          phone: dto.phone ?? null,
          email: dto.email ?? null,
          notes: dto.notes ?? null,
          source: dto.source ?? undefined,
          statusId: dto.statusId,
          ownerId: dto.ownerId,
        },
        include: {
          status: true,
          owner: { select: { id: true, name: true, email: true, role: true } },
        },
      });
    });
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto) {
    return this.db.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id } });
      if (!lead) {
        throw new NotFoundException('lead');
      }
      const status = await tx.leadStatus.findUnique({ where: { id: dto.statusId } });
      if (!status) {
        throw new NotFoundException('status');
      }
      if (status.tmkReasonRequired && !dto.tmkReason) {
        throw new BadRequestException('TMK reason required');
      }
      return tx.lead.update({
        where: { id },
        data: {
          statusId: dto.statusId,
          notes: dto.tmkReason ?? lead.notes,
        },
        include: {
          status: true,
          owner: { select: { id: true, name: true, email: true, role: true } },
        },
      });
    });
  }
}
