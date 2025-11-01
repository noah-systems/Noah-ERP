import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateLeadDto, UpdateLeadStatusDto } from './leads.dto.js';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto) {
    const [status, owner] = await Promise.all([
      this.prisma.leadStatus.findUnique({ where: { id: dto.statusId } }),
      this.prisma.user.findUnique({ where: { id: dto.ownerId } }),
    ]);
    if (!status) throw new BadRequestException('statusId inválido');
    if (!owner) throw new BadRequestException('ownerId inválido');

    return this.prisma.lead.create({
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
    });
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead não encontrado');

    return this.prisma.lead.update({
      where: { id },
      data: { statusId: dto.statusId, notes: dto.notes ?? lead.notes },
    });
  }
}
