import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { CreateLeadDto, UpdateLeadDto } from './leads.dto.js';
import { Role } from '../auth/roles.enum.js';

@Injectable()
export class LeadsService {
  constructor(private readonly db: DatabaseService) {}

  list() {
    return this.db.lead
      .findAll({
      limit: 50,
      order: [['createdAt', 'DESC']],
      include: [
        { association: 'status' },
        { association: 'owner', attributes: ['id', 'name', 'email', 'role'] },
      ],
    })
      .then((items) => items.map((item) => item.toJSON()));
  }

  async create(dto: CreateLeadDto) {
    const [status, owner] = await Promise.all([
      dto.statusId
        ? this.db.leadStatus.findByPk(dto.statusId)
        : this.db.leadStatus.findOne({ order: [['createdAt', 'ASC']] }),
      dto.ownerId
        ? this.db.user.findByPk(dto.ownerId)
        : this.db.user.findOne({ where: { role: Role.ADMIN_NOAH }, order: [['createdAt', 'ASC']] }),
    ]);
    if (!status) throw new BadRequestException('statusId inválido');
    if (!owner) throw new BadRequestException('ownerId inválido');

    const statusId = typeof (status as any)?.get === 'function' ? status.get('id') : (status as any).id;
    const ownerId = typeof (owner as any)?.get === 'function' ? owner.get('id') : (owner as any).id;

    return this.db.lead
      .create({
        company: dto.company ?? dto.name,
        name: dto.name,
        segment: dto.segment ?? null,
        headcount: dto.headcount ?? null,
        contact: dto.contact ?? null,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        notes: dto.notes ?? null,
        source: dto.source ?? 'MANUAL',
        statusId,
        ownerId,
      })
      .then((lead) => lead.toJSON());
  }

  async updateStatus(id: string, dto: UpdateLeadDto) {
    const lead = await this.db.lead.findByPk(id);
    if (!lead) throw new NotFoundException('Lead não encontrado');

    await lead.update({
      statusId: dto.statusId ?? lead.get('statusId'),
      notes: dto.notes ?? lead.get('notes'),
    });

    return lead.toJSON();
  }
}
