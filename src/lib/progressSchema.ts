// Validation for Progress coming from outside the app (backup import, or
// corrupted storage). Hand-written to keep zod out of the client bundle.
import type { ChatMessage, CVScore, DishProgress, Progress } from '../types';
import { emptyProgress } from './game';

export const BACKUP_FORMAT = 'forkyeah-backup';
export const BACKUP_VERSION = 1;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isDay = (v: unknown): v is string => isStr(v) && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isISO = (v: unknown): v is string => isStr(v) && !Number.isNaN(Date.parse(v));

function isScore(v: unknown): v is CVScore {
  return isObj(v) && ['plating', 'technique', 'colorBalance', 'portioning', 'overall'].every(k => isNum(v[k]));
}

function isDishProgress(v: unknown): v is DishProgress {
  return (
    isObj(v) &&
    Array.isArray(v.stepsDone) &&
    v.stepsDone.every(n => Number.isInteger(n) && (n as number) >= 0) &&
    (v.completedAt === undefined || isISO(v.completedAt)) &&
    (v.bestScore === undefined || isScore(v.bestScore))
  );
}

function isChat(v: unknown): v is ChatMessage {
  return isObj(v) && isStr(v.id) && (v.role === 'user' || v.role === 'model') && isStr(v.text) && isISO(v.at);
}

const isRecordOf = <T,>(v: unknown, check: (x: unknown) => x is T): v is Record<string, T> =>
  isObj(v) && Object.values(v).every(check);

export function isProgress(v: unknown): v is Progress {
  return (
    isObj(v) &&
    isObj(v.profile) && isStr(v.profile.name) && isStr(v.profile.emoji) &&
    isNum(v.xp) && v.xp >= 0 &&
    isObj(v.streak) && isNum(v.streak.count) && (v.streak.lastDay === null || isDay(v.streak.lastDay)) &&
    isRecordOf(v.dishes, isDishProgress) &&
    isRecordOf(v.stamps, isISO) &&
    isRecordOf(v.quests, isISO) &&
    Array.isArray(v.missionDays) && v.missionDays.every(isDay) &&
    Array.isArray(v.chat) && v.chat.every(isChat)
  );
}

// ── Backup file (export / import) ─────────────────────────────
export function toBackup(p: Progress, now: Date): string {
  return JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: now.toISOString(), progress: p }, null, 2);
}

export type ImportResult = { ok: true; progress: Progress } | { ok: false; error: string };

export function fromBackup(text: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file isn’t valid JSON.' };
  }
  if (!isObj(data) || data.format !== BACKUP_FORMAT) {
    return { ok: false, error: 'That isn’t a Fork Yeah backup file.' };
  }
  if (!isNum(data.version) || data.version > BACKUP_VERSION) {
    return { ok: false, error: 'This backup is from a newer version of Fork Yeah. Update the app and try again.' };
  }
  // Fill any fields added since the backup was made, then validate
  const progress = { ...emptyProgress(), ...(isObj(data.progress) ? data.progress : {}) };
  if (!isProgress(progress)) return { ok: false, error: 'This backup is damaged and can’t be restored.' };
  return { ok: true, progress };
}
