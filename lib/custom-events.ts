export const validEventName = (name: unknown): name is string => typeof name === 'string' && /^[a-zA-Z][a-zA-Z0-9_.:-]{0,63}$/.test(name);
export function eventProperties(value: unknown): Record<string, string | number | boolean> | null {
  if (value === undefined) return {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value);
  if (entries.length > 10) return null;
  const output: Record<string, string | number | boolean> = {};
  for (const [key, item] of entries) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(key) || /email|password|token|secret|address|phone|user_?id|^ip$/i.test(key)) return null;
    if (typeof item === 'string' && item.length <= 200 || typeof item === 'boolean' || typeof item === 'number' && Number.isFinite(item)) output[key] = item;
    else return null;
  }
  return output;
}
