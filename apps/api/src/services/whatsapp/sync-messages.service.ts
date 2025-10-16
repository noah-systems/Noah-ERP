/*
 * Utility helpers for synchronising message history from Baileys 7.x sockets.
 *
 * The code intentionally keeps the dependencies abstract so it can be reused
 * in environments where the concrete database or socket implementation varies
 * between projects.  The behaviour aims to mirror the production service that
 * operates on top of Sequelize models.
 */

export interface WhatsappMessageKey {
  id?: string;
  fromMe?: boolean;
}

export interface WhatsappRawMessage {
  key?: WhatsappMessageKey;
  messageId?: string;
  messageTimestamp?: any;
  message?: any;
  pushName?: string | null;
  participant?: string | null;
  remoteJid?: string | null;
  fromMe?: boolean;
}

export interface WhatsappHistory {
  messages: WhatsappRawMessage[];
  cursor?: unknown;
}

export interface HistoryFetcher {
  fetchMessageHistory: (
    chatId: string,
    cursor: WhatsappMessageKey | undefined,
    limit: number
  ) => Promise<WhatsappHistory>;
}

export interface StoredMessage {
  messageId: string | null;
  messageTimestamp?: Date | null;
  messageFromMe?: boolean;
}

export interface MessageRepository {
  findLastMessage: () => Promise<StoredMessage | null>;
  persistBatch: (rows: PersistableRawMessage[]) => Promise<void>;
}

export interface PersistableRawMessage {
  batchId: unknown;
  sessionNumber: string;
  sessionId: string;
  status: 'pending' | 'synced';
  tenantId: string;
  ticketId: string;
  messageId: string;
  messageTimestamp: Date | null;
  messageBody: string;
  messageType: 'chat';
  messagePayload: unknown;
  messageMediaInfo: unknown;
  messageFromMe: boolean;
  messageContactName: string | null;
  messageContactNumber: string | null;
  messageContactPushname: string | null;
}

export interface SyncMessagesOptions {
  tenantId: string;
  ticketId: string;
  sessionNumber: string;
  sessionId: string;
  limit?: number;
  historyBatchId?: unknown;
}

export interface SyncMessagesContext {
  historyFetcher: HistoryFetcher;
  repository: MessageRepository;
  logger?: {
    info: (payload: Record<string, unknown>, message: string) => void;
    warn: (payload: Record<string, unknown>, message: string) => void;
  };
}

const HISTORY_FETCH_TIMEOUT_MS = Number(process.env.HISTORY_FETCH_TIMEOUT_MS ?? 180_000);
const HISTORY_FETCH_MAX_RETRIES = Number(process.env.HISTORY_FETCH_MAX_RETRIES ?? 6);
const HISTORY_FETCH_MIN_COUNT = Number(process.env.HISTORY_FETCH_MIN_COUNT ?? 10);
const SYNC_INCLUDE_MEDIA = false;

function withTimeout<T>(promise: Promise<T>, ms: number, code = 'ERR_HISTORY_FETCH_TIMEOUT'): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const error: NodeJS.ErrnoException = new Error(code) as NodeJS.ErrnoException;
      error.code = code;
      reject(error);
    }, ms);
  });

  return Promise.race([promise, timeout])
    .finally(() => clearTimeout(timer)) as Promise<T>;
}

function toDateFromWaTimestamp(ts: any): Date | null {
  if (ts == null) return null;
  if (ts instanceof Date) return ts;
  if (typeof ts === 'number') return new Date(ts > 1e12 ? ts : ts * 1000);
  if (typeof ts === 'bigint') return new Date(Number(ts) * 1000);
  if (typeof ts === 'string') return new Date(Number(ts) * 1000);
  if (typeof ts === 'object') {
    if (typeof (ts as any).toNumber === 'function') {
      return new Date((ts as any).toNumber() * 1000);
    }
    const candidate = (ts as any).low;
    if (typeof candidate === 'number') {
      const hi = ((ts as any).high ?? 0) * 2 ** 32;
      return new Date((hi + candidate) * 1000);
    }
  }
  return new Date(Date.now());
}

function extractText(raw: WhatsappRawMessage): string | null {
  const payload = raw?.message ?? {};
  if (payload.conversation) return payload.conversation;
  if (payload.extendedTextMessage?.text) return payload.extendedTextMessage.text;
  const ephemeral = payload.ephemeralMessage?.message ?? {};
  if (ephemeral.conversation) return ephemeral.conversation;
  if (ephemeral.extendedTextMessage?.text) return ephemeral.extendedTextMessage.text;
  return null;
}

function uniqueByMessageId(rows: PersistableRawMessage[]): PersistableRawMessage[] {
  const seen = new Set<string>();
  const ordered: PersistableRawMessage[] = [];
  for (const row of rows) {
    if (seen.has(row.messageId)) continue;
    seen.add(row.messageId);
    ordered.push(row);
  }
  return ordered;
}

export interface SyncResult {
  inserted: number;
  fetched: number;
  attempts: number;
  batchSize: number;
}

export async function syncMessages(
  ctx: SyncMessagesContext,
  options: SyncMessagesOptions
): Promise<SyncResult> {
  const { historyFetcher, repository, logger } = ctx;
  const { tenantId, ticketId, sessionNumber, sessionId, limit, historyBatchId } = options;

  const lastMessage = await repository.findLastMessage();
  const cursor = lastMessage?.messageId
    ? { id: lastMessage.messageId, fromMe: Boolean(lastMessage.messageFromMe) }
    : undefined;

  let attempts = 0;
  let batch = Math.max(HISTORY_FETCH_MIN_COUNT, Math.min(200, limit ?? 100));
  let history: WhatsappHistory;

  // Retry with exponential back-off on timeout errors.
  while (true) {
    try {
      const promise = historyFetcher.fetchMessageHistory(sessionNumber, cursor, batch);
      history = await withTimeout(promise, HISTORY_FETCH_TIMEOUT_MS, 'ERR_HISTORY_FETCH_TIMEOUT');
      break;
    } catch (error) {
      const code = (error as any)?.code ?? String((error as any)?.message ?? '');
      const isTimeout = code.includes('ERR_HISTORY_FETCH_TIMEOUT');
      if (isTimeout && attempts < HISTORY_FETCH_MAX_RETRIES) {
        attempts += 1;
        batch = Math.max(HISTORY_FETCH_MIN_COUNT, Math.floor(batch / 2));
        logger?.warn(
          { tenantId, ticketId, attempts, batch, error: (error as Error).message },
          'Timeout while fetching WhatsApp history, retrying with smaller batch'
        );
        continue;
      }
      throw error;
    }
  }

  const messages = Array.isArray(history?.messages) ? [...history.messages] : [];
  messages.sort((a, b) => {
    const tsA = toDateFromWaTimestamp(a.messageTimestamp)?.getTime() ?? 0;
    const tsB = toDateFromWaTimestamp(b.messageTimestamp)?.getTime() ?? 0;
    return tsA - tsB;
  });

  const rows: PersistableRawMessage[] = [];
  for (const msg of messages) {
    const text = extractText(msg);
    if (!text && !SYNC_INCLUDE_MEDIA) {
      continue;
    }

    const messageId = msg.key?.id ?? msg.messageId;
    if (!messageId) {
      continue;
    }

    rows.push({
      batchId: historyBatchId ?? history?.cursor ?? null,
      sessionNumber,
      sessionId,
      status: 'pending',
      tenantId,
      ticketId,
      messageId,
      messageTimestamp: toDateFromWaTimestamp(msg.messageTimestamp),
      messageBody: text ?? '',
      messageType: 'chat',
      messagePayload: null,
      messageMediaInfo: null,
      messageFromMe: Boolean(msg.key?.fromMe ?? msg.fromMe),
      messageContactName: msg.pushName ?? null,
      messageContactNumber: (msg.participant ?? msg.remoteJid) ?? null,
      messageContactPushname: msg.pushName ?? null,
    });
  }

  const deduped = uniqueByMessageId(rows);
  await repository.persistBatch(deduped);

  logger?.info(
    {
      tenantId,
      ticketId,
      inserted: deduped.length,
      fetched: messages.length,
      attempts,
      batch,
    },
    'WhatsApp history synchronised'
  );

  return {
    inserted: deduped.length,
    fetched: messages.length,
    attempts,
    batchSize: batch,
  };
}

export const SYNC_MESSAGES_CONSTANTS = {
  HISTORY_FETCH_TIMEOUT_MS,
  HISTORY_FETCH_MAX_RETRIES,
  HISTORY_FETCH_MIN_COUNT,
  SYNC_INCLUDE_MEDIA,
};

