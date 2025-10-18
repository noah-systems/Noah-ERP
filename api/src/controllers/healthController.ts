import type { RequestHandler } from 'express';

export const healthCheck: RequestHandler = (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
};
