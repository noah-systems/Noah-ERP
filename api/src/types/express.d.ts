import type { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sessionId: string;
  tokenId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      tokenId?: string;
    }
  }
}

export {};
