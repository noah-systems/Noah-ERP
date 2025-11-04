import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { DatabaseService } from '../../database/database.service.js';
import { ImplStatus } from '../../database/enums.js';
import { UpdateImplementationDto } from './impl.dto.js';

@Injectable()
export class ImplService {
  constructor(private readonly db: DatabaseService) {}

  list() {
    return this.db.implementationTask
      .findAll({
        order: [['createdAt', 'DESC']],
        include: [
          {
            association: 'opp',
            include: [
              { association: 'stage' },
              { association: 'owner', attributes: ['id', 'name', 'email', 'role'] },
            ],
          },
        ],
      })
      .then((items) => items.map((item) => item.toJSON()));
  }

  async update(id: string, dto: UpdateImplementationDto) {
    const result = await this.db.transaction(async (transaction: Transaction) => {
      const task = await this.db.implementationTask.findByPk(id, {
        include: [{ association: 'opp' }],
        transaction,
      });
      if (!task) throw new NotFoundException('implementation');
      if (dto.status === ImplStatus.SCHEDULED && !dto.schedule) {
        throw new BadRequestException('schedule required to set status scheduled');
      }
      const data: Record<string, unknown> = {};
      if (dto.status) {
        data.status = dto.status;
      }
      if (dto.note !== undefined) {
        data.note = dto.note;
      }
      if (dto.schedule !== undefined) {
        data.schedule = dto.schedule ? new Date(dto.schedule) : null;
      }
      await task.update(data, { transaction });

      if (dto.status === ImplStatus.DONE || dto.status === ImplStatus.NO_SHOW) {
        const targetStageName =
          dto.status === ImplStatus.DONE ? 'Venda Ganha' : 'Vencimento Trial';
        const stage = await this.db.opportunityStage.findOne({
          where: { name: targetStageName },
          transaction,
        });
        if (stage) {
          const oppId = task.get('oppId') as string;
          const opp = await this.db.opportunity.findByPk(oppId, { transaction });
          const oppData = task.get('opp') as { stageId?: string; activation?: Date } | undefined;
          if (opp) {
            await opp.update(
              {
                stageId: stage.get('id'),
                activation:
                  dto.status === ImplStatus.DONE ? new Date() : opp.get('activation'),
              },
              { transaction },
            );
          }
          await this.db.oppHistory.create(
            {
              oppId,
              actorId: dto.actorId,
              fromStageId: oppData?.stageId ?? null,
              toStageId: stage.get('id') as string,
              note:
                dto.status === ImplStatus.DONE
                  ? 'Implementation completed'
                  : 'Implementation no-show',
            },
            { transaction },
          );
        }
      }

      return this.db.implementationTask.findByPk(id, {
        include: [
          {
            association: 'opp',
            include: [
              { association: 'stage' },
              { association: 'owner', attributes: ['id', 'name', 'email', 'role'] },
            ],
          },
        ],
        transaction,
      });
    });

    return result ? result.toJSON() : null;
  }
}
