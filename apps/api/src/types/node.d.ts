declare interface BufferLike {
  length: number;
  toString(encoding?: string): string;
}

declare const Buffer: {
  from(data: string, encoding?: string): BufferLike;
};

declare module 'crypto' {
  interface Hmac {
    update(data: string): Hmac;
    digest(encoding: 'base64url' | 'hex'): string;
  }

  export function createHmac(algorithm: string, secret: string): Hmac;
  export function timingSafeEqual(a: BufferLike, b: BufferLike): boolean;
}

declare type BeforeExitListener = () => void;

declare const process: {
  env: Record<string, string | undefined>;
  on(event: 'beforeExit', listener: BeforeExitListener): void;
};
