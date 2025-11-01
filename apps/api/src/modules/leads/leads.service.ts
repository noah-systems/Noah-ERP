import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateLeadDto, UpdateLeadDto } from './leads.dto.js';
import { Role } from '../auth/roles.enum.js';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto) {
    const [status, owner] = await Promise.all([
      dto.statusId
        ? this.prisma.leadStatus.findUnique({ where: { id: dto.statusId } })
        : this.prisma.leadStatus.findFirst({ orderBy: { createdAt: 'asc' } }),
      dto.ownerId
        ? this.prisma.user.findUnique({ where: { id: dto.ownerId } })
        : this.prisma.user.findFirst({
            where: { role: Role.ADMIN_NOAH },
            orderBy: { createdAt: 'asc' },
          }),
    ]);
    if (!status) throw new BadRequestException('statusId inválido');
    if (!owner) throw new BadRequestException('ownerId inválido');

    return this.prisma.lead.create({
      data: {
        company: dto.company ?? dto.name,
        name: dto.name,
        segment: dto.segment ?? null,
        headcount: dto.headcount ?? undefined,
        contact: dto.contact ?? null,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        notes: dto.notes ?? null,
        source: dto.source ?? undefined,
        statusId: status.id,
        ownerId: owner.id,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateLeadDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead não encontrado');

    return this.prisma.lead.update({
      where: { id },
      data: {
        statusId: dto.statusId ?? lead.statusId,
        notes: dto.notes ?? lead.notes,
      },
    });
  }
}
