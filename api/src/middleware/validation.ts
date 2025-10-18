import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';

import { AppError } from '../utils/app-error';

interface ValidationSchema {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validate(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      return next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return next(new AppError(400, 'Dados inválidos.', error.flatten()));
      }
      return next(error);
    }
  };
}
