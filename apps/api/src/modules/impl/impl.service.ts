import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ImplStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateImplementationDto } from './impl.dto';

@Injectable()
export class ImplService {
  constructor(private readonly db: PrismaService) {}

  list() {
    return this.db.implementationTask.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        opp: {
          include: {
            stage: true,
            owner: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateImplementationDto) {
    return this.db.$transaction(async (tx) => {
      const task = await tx.implementationTask.findUnique({
        where: { id },
        include: { opp: true },
      });
      if (!task) throw new NotFoundException('implementation');
      if (dto.status === ImplStatus.SCHEDULED && !dto.schedule) {
        throw new BadRequestException('schedule required to set status scheduled');
      }
      const data: Prisma.ImplementationTaskUpdateInput = {};
      if (dto.status) {
        data.status = dto.status;
      }
      if (dto.note !== undefined) {
        data.note = dto.note;
      }
      if (dto.schedule !== undefined) {
        data.schedule = dto.schedule ? new Date(dto.schedule) : null;
      }
      const updated = await tx.implementationTask.update({
        where: { id },
        data,
      });

      if (dto.status === ImplStatus.DONE || dto.status === ImplStatus.NO_SHOW) {
        const targetStageName =
          dto.status === ImplStatus.DONE ? 'Venda Ganha' : 'Vencimento Trial';
        const stage = await tx.opportunityStage.findFirst({ where: { name: targetStageName } });
        if (stage) {
          await tx.opportunity.update({
            where: { id: task.oppId },
            data: {
              stageId: stage.id,
              activation: dto.status === ImplStatus.DONE ? new Date() : task.opp.activation,
            },
          });
          await tx.oppHistory.create({
            data: {
              oppId: task.oppId,
              actorId: dto.actorId,
              fromStageId: task.opp.stageId,
              toStageId: stage.id,
              note:
                dto.status === ImplStatus.DONE
                  ? 'Implementation completed'
                  : 'Implementation no-show',
            },
          });
        }
      }

      return updated;
    });
  }
}
