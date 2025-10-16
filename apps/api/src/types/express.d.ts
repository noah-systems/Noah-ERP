import type { Role } from '@prisma/client';

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

declare module 'express' {
  interface Request {
    method: string;
    url?: string;
    originalUrl?: string;
    headers?: Record<string, string | string[] | undefined>;
    user?: Express.UserPayload;
  }

  interface Response {
    statusCode: number;
    setHeader(name: string, value: string): this;
  }

  interface NextFunction {
    (err?: unknown): void;
  }

  type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;

  export { Request, Response, NextFunction, RequestHandler };
}

export {};
