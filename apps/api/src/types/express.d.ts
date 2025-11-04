import type { Role } from '../database/enums.js';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role?: Role;
      token?: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
