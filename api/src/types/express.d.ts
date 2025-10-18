import type { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
      token?: string | null;
    }
  }
}

export {};
