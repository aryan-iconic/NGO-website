const rateLimits = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (rateLimits.size > 10_000) {
    for (const [entryKey, entry] of rateLimits) if (entry.expiresAt <= now) rateLimits.delete(entryKey);
    if (rateLimits.size > 30_000) rateLimits.clear();
  }
  const record = rateLimits.get(key);
  
  if (!record || record.expiresAt < now) {
    rateLimits.set(key, { count: 1, expiresAt: now + windowMs });
    return true; // Allowed
  }
  
  if (record.count >= limit) {
    return false; // Rate limited
  }
  
  record.count += 1;
  return true; // Allowed
}
