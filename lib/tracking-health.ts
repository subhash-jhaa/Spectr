import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';

export const TRACKER_VERSION = '2.1.1';
type Receipt = { receivedAt: string; version: string | null };
type Probe = { projectId: string; expiresAt: number; receivedAt: string | null; version: string | null };
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN, signal: () => AbortSignal.timeout(1000), retry: false }) : null;
// Development only. Production uses the shared Redis store across app instances.
const local = new Map<string, { value: unknown; expiresAt: number }>();
async function read<T>(key: string): Promise<T | null> {
  if (redis) return redis.get<T>(key);
  if (process.env.NODE_ENV === 'production') throw new Error('Tracking health requires Redis');
  const entry = local.get(key);
  if (!entry || entry.expiresAt <= Date.now()) { local.delete(key); return null; }
  return entry.value as T;
}
async function write(key: string, value: unknown, seconds: number) {
  if (redis) { await redis.set(key, value, { ex: seconds }); return; }
  if (process.env.NODE_ENV === 'production') throw new Error('Tracking health requires Redis');
  for (const [key, entry] of local) if (entry.expiresAt <= Date.now()) local.delete(key);
  if (local.size >= 1000) local.delete(local.keys().next().value!);
  local.set(key, { value, expiresAt: Date.now() + seconds * 1000 });
}
const receiptKey = (id: string) => `spectr:tracking-health:${id}`;
const probeKey = (token: string) => `spectr:tracking-probe:${token}`;
export async function recordTrackingReceipt(projectId: string, version?: string) {
  await write(receiptKey(projectId), { receivedAt: new Date().toISOString(), version: version || null }, 30 * 86400);
}
export const readTrackingReceipt = (projectId: string) => read<Receipt>(receiptKey(projectId));
export async function createTrackingProbe(projectId: string) {
  const token = randomUUID();
  const probe: Probe = { projectId, expiresAt: Date.now() + 300000, receivedAt: null, version: null };
  await write(probeKey(token), probe, 300);
  return { token, expiresAt: probe.expiresAt };
}
export async function readTrackingProbe(projectId: string, token: string) {
  const probe = await read<Probe>(probeKey(token));
  return probe?.projectId === projectId && probe.expiresAt > Date.now() ? probe : null;
}
export async function acceptTrackingProbe(projectId: string, token: string, version?: string) {
  const probe = await readTrackingProbe(projectId, token);
  if (!probe) return false;
  await write(probeKey(token), { ...probe, receivedAt: probe.receivedAt || new Date().toISOString(), version: version || null }, Math.max(1, Math.ceil((probe.expiresAt - Date.now()) / 1000)));
  return true;
}
