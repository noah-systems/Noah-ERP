import type { Provider } from '@nestjs/common';
import type { ModelStatic, Sequelize } from 'sequelize';
import { SEQUELIZE } from '../../database/sequelize.module.js';
import {
  ImplementationTask,
  initImplementationTaskModel,
} from './models/implementation-task.model.js';
import {
  ImplementationEvent,
  initImplementationEventModel,
} from './models/implementation-event.model.js';

export interface ImplementationModelRegistry {
  task: ModelStatic<ImplementationTask>;
  event: ModelStatic<ImplementationEvent>;
}

export const IMPLEMENTATION_MODELS = Symbol('IMPLEMENTATION_MODELS');

function ensureImplementationModels(sequelize: Sequelize): ImplementationModelRegistry {
  const taskModel = initImplementationTaskModel(sequelize);
  const eventModel = initImplementationEventModel(sequelize);

  if (!taskModel.associations.events) {
    taskModel.hasMany(eventModel, {
      as: 'events',
      foreignKey: 'taskId',
      sourceKey: 'id',
    });
  }

  if (!eventModel.associations.task) {
    eventModel.belongsTo(taskModel, {
      as: 'task',
      foreignKey: 'taskId',
      targetKey: 'id',
    });
  }

  return { task: taskModel, event: eventModel };
}

export const implementationProviders: Provider[] = [
  {
    provide: IMPLEMENTATION_MODELS,
    useFactory: (sequelize: Sequelize) => ensureImplementationModels(sequelize),
    inject: [SEQUELIZE],
  },
];
