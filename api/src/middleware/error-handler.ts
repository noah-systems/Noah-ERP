import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { HttpError } from '../utils/httpError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details ?? null });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'validation_error',
      details: err.flatten(),
    });
  }

  console.error(err);
  return res.status(500).json({ error: 'internal_server_error' });
};
