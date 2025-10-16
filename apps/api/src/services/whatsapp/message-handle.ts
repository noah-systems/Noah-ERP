/**
 * Handler do histórico (Baileys 7) — NÃO descartar extendedText/ephemeral com texto.
 * Remover/evitar filtros que ignorem tudo além de "conversation".
 * Delegar a normalização para buildMessage/extractText; manter APENAS TEXTO (sem mídia) neste fluxo.
 */
export const WHATSAPP_HISTORY_HANDLER_NOTE = true;
