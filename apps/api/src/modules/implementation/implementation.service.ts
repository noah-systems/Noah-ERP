import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ModelStatic, Op, Sequelize, Transaction } from 'sequelize';
import { SEQUELIZE } from '../../database/sequelize.module.js';
import type { ImplementationEventAttributesUnsafe } from './models/implementation-event.model.js';
import {
  ImplementationEvent,
  ImplementationEventType,
} from './models/implementation-event.model.js';
import type { ImplementationTaskAttributesUnsafe } from './models/implementation-task.model.js';
import {
  ImplementationTask,
  ImplementationTaskStatus,
} from './models/implementation-task.model.js';
import { CreateImplementationTaskDto } from './dto/create-implementation-task.dto.js';
import { ListImplementationTasksDto } from './dto/list-implementation-tasks.dto.js';
import { ScheduleImplementationTaskDto } from './dto/schedule-implementation-task.dto.js';
import { CompleteImplementationTaskDto } from './dto/complete-implementation-task.dto.js';
import { MarkUnsuccessfulImplementationTaskDto } from './dto/unsuccessful-implementation-task.dto.js';
import { MoveImplementationTaskDto } from './dto/move-implementation-task.dto.js';
import {
  IMPLEMENTATION_MODELS,
  ImplementationModelRegistry,
} from './implementation.providers.js';

interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ImplementationService {
  private readonly taskModel: ModelStatic<ImplementationTask>;

  private readonly eventModel: ModelStatic<ImplementationEvent>;

  constructor(
    @Inject(IMPLEMENTATION_MODELS) models: ImplementationModelRegistry,
    @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
  ) {
    this.taskModel = models.task;
    this.eventModel = models.event;
  }

  async list(
    query: ListImplementationTasksDto,
  ): Promise<PaginatedResult<ImplementationTaskAttributesUnsafe>> {
    const { page, pageSize, status, q, from, to, assigneeId, segment } = query;
    const where: Record<string, unknown> & { [key: symbol]: unknown } = {};

    if (status) {
      where.status = status;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (segment) {
      where.segment = { [Op.iLike]: `%${segment}%` };
    }

    if (from || to) {
      const range: Record<string, unknown> & { [key: symbol]: unknown } = {};
      if (from) {
        const fromDate = new Date(from);
        if (Number.isNaN(fromDate.valueOf())) {
          throw new BadRequestException('from must be a valid ISO date');
        }
        range[Op.gte] = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (Number.isNaN(toDate.valueOf())) {
          throw new BadRequestException('to must be a valid ISO date');
        }
        range[Op.lte] = toDate;
      }
      where.scheduledAt = range;
    }

    if (q) {
      const term = q.trim();
      if (term) {
        where[Op.or] = [
          { domain: { [Op.iLike]: `%${term}%` } },
          { notes: { [Op.iLike]: `%${term}%` } },
        ];
      }
    }

    const offset = (page - 1) * pageSize;
    const { rows, count } = await this.taskModel.findAndCountAll({
      where,
      order: [
        ['status', 'ASC'],
        ['position', 'ASC'],
        ['createdAt', 'ASC'],
      ],
      limit: pageSize,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / pageSize));
    const data = rows.map(
      (row) => row.toJSON() as ImplementationTaskAttributesUnsafe,
    );

    return {
      data,
      meta: {
        page,
        pageSize,
        total: count,
        totalPages,
      },
    };
  }

  async create(
    dto: CreateImplementationTaskDto,
  ): Promise<ImplementationTaskAttributesUnsafe> {
    return this.sequelize.transaction(async (transaction) => {
      const position = await this.nextPosition(ImplementationTaskStatus.PENDING, transaction);
      const task = await this.taskModel.create(
        {
          accountId: dto.accountId,
          domain: dto.domain,
          createdById: dto.createdById,
          notes: dto.notes ?? null,
          segment: dto.segment ?? null,
          status: ImplementationTaskStatus.PENDING,
          position,
        },
        { transaction },
      );

      if (dto.notes) {
        await this.eventModel.create(
          {
            taskId: task.id,
            type: ImplementationEventType.COMMENT,
            payload: { notes: dto.notes },
            createdById: dto.createdById,
          },
          { transaction },
        );
      }

      return task.toJSON() as ImplementationTaskAttributesUnsafe;
    });
  }

  async schedule(
    id: string,
    dto: ScheduleImplementationTaskDto,
  ): Promise<ImplementationTaskAttributesUnsafe> {
    const scheduledAt = new Date(dto.scheduledAt);
    if (Number.isNaN(scheduledAt.valueOf())) {
      throw new BadRequestException('scheduledAt must be a valid ISO date');
    }

    return this.sequelize.transaction(async (transaction) => {
      const task = await this.findTaskForUpdate(id, transaction);
      await this.removeFromColumn(task, transaction);
      const position = await this.nextPosition(ImplementationTaskStatus.SCHEDULED, transaction);
      await task.update(
        {
          status: ImplementationTaskStatus.SCHEDULED,
          scheduledAt,
          assigneeId: dto.assigneeId,
          notes: dto.notes ?? task.notes ?? null,
          position,
        },
        { transaction },
      );

      await this.eventModel.create(
        {
          taskId: task.id,
          type: ImplementationEventType.SCHEDULED,
          payload: {
            scheduledAt: scheduledAt.toISOString(),
            assigneeId: dto.assigneeId,
            notes: dto.notes ?? null,
          },
          createdById: dto.performedById,
        },
        { transaction },
      );

      return (await task.reload({ transaction })).toJSON() as ImplementationTaskAttributesUnsafe;
    });
  }

  async complete(
    id: string,
    dto: CompleteImplementationTaskDto,
  ): Promise<ImplementationTaskAttributesUnsafe> {
    return this.sequelize.transaction(async (transaction) => {
      const task = await this.findTaskForUpdate(id, transaction);
      await this.removeFromColumn(task, transaction);
      const position = await this.nextPosition(ImplementationTaskStatus.DONE, transaction);
      await task.update(
        {
          status: ImplementationTaskStatus.DONE,
          position,
          notes: dto.notes ?? task.notes ?? null,
        },
        { transaction },
      );

      await this.eventModel.create(
        {
          taskId: task.id,
          type: ImplementationEventType.DONE,
          payload: {
            notes: dto.notes ?? null,
          },
          createdById: dto.performedById,
        },
        { transaction },
      );

      return (await task.reload({ transaction })).toJSON() as ImplementationTaskAttributesUnsafe;
    });
  }

  async markUnsuccessful(
    id: string,
    dto: MarkUnsuccessfulImplementationTaskDto,
  ): Promise<ImplementationTaskAttributesUnsafe> {
    return this.sequelize.transaction(async (transaction) => {
      const task = await this.findTaskForUpdate(id, transaction);
      await this.removeFromColumn(task, transaction);
      const position = await this.nextPosition(ImplementationTaskStatus.UNSUCCESSFUL, transaction);
      await task.update(
        {
          status: ImplementationTaskStatus.UNSUCCESSFUL,
          position,
          notes: dto.notes ?? task.notes ?? null,
        },
        { transaction },
      );

      await this.eventModel.create(
        {
          taskId: task.id,
          type: ImplementationEventType.UNSUCCESSFUL,
          payload: {
            notes: dto.notes ?? null,
          },
          createdById: dto.performedById,
        },
        { transaction },
      );

      return (await task.reload({ transaction })).toJSON() as ImplementationTaskAttributesUnsafe;
    });
  }

  async move(
    id: string,
    dto: MoveImplementationTaskDto,
  ): Promise<ImplementationTaskAttributesUnsafe> {
    return this.sequelize.transaction(async (transaction) => {
      const task = await this.findTaskForUpdate(id, transaction);
      const fromStatus = task.status;
      const toStatus = dto.status ?? fromStatus;

      if (!Object.values(ImplementationTaskStatus).includes(toStatus)) {
        throw new BadRequestException('Invalid status');
      }

      if (dto.status && dto.status !== task.status) {
        await this.removeFromColumn(task, transaction);
      }

      const newPosition = await this.repositionTask(
        task,
        toStatus,
        dto.position,
        transaction,
      );

      await task.update(
        {
          status: toStatus,
          position: newPosition,
        },
        { transaction },
      );

      return (await task.reload({ transaction })).toJSON() as ImplementationTaskAttributesUnsafe;
    });
  }

  async getEvents(id: string): Promise<ImplementationEventAttributesUnsafe[]> {
    const task = await this.taskModel.findByPk(id);
    if (!task) {
      throw new NotFoundException('Implementation task not found');
    }

    const events = await this.eventModel.findAll({
      where: { taskId: id },
      order: [['createdAt', 'ASC']],
    });

    return events.map(
      (event) => event.toJSON() as ImplementationEventAttributesUnsafe,
    );
  }

  private async nextPosition(
    status: ImplementationTaskStatus,
    transaction: Transaction,
  ): Promise<number> {
    const maxResult = await this.taskModel.findOne({
      where: { status },
      order: [['position', 'DESC']],
      transaction,
    });

    return (maxResult?.position ?? 0) + 1;
  }

  private async findTaskForUpdate(
    id: string,
    transaction: Transaction,
  ): Promise<ImplementationTask> {
    const task = await this.taskModel.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!task) {
      throw new NotFoundException('Implementation task not found');
    }

    return task;
  }

  private async removeFromColumn(task: ImplementationTask, transaction: Transaction): Promise<void> {
    const subsequentTasks = await this.taskModel.findAll({
      where: {
        status: task.status,
        position: { [Op.gt]: task.position },
      },
      order: [['position', 'ASC']],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    await Promise.all(
      subsequentTasks.map((item, index) =>
        item.update(
          {
            position: task.position + index,
          },
          { transaction },
        ),
      ),
    );
  }

  private async repositionTask(
    task: ImplementationTask,
    status: ImplementationTaskStatus,
    desiredPosition: number | undefined,
    transaction: Transaction,
  ): Promise<number> {
    const tasksInColumn = await this.taskModel.findAll({
      where: { status },
      order: [['position', 'ASC']],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const sanitizedPosition = Math.max(0, desiredPosition ?? tasksInColumn.length);
    const clampedPosition = Math.min(sanitizedPosition, tasksInColumn.length);

    const updatedTasks = tasksInColumn.map((item, index) => {
      const offset = index >= clampedPosition ? index + 1 : index;
      return item.update({ position: offset }, { transaction });
    });

    await Promise.all(updatedTasks);

    return clampedPosition;
  }
}
