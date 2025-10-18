import type { RequestHandler } from 'express';
import type { AnyZodObject, ZodTypeAny } from 'zod';

export const validateBody = (schema: AnyZodObject | ZodTypeAny): RequestHandler =>
  async (req, _res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      return next(error);
    }
  };

export const validateQuery = (schema: AnyZodObject | ZodTypeAny): RequestHandler =>
  async (req, _res, next) => {
    try {
      req.query = await schema.parseAsync(req.query);
      return next();
    } catch (error) {
      return next(error);
    }
  };
