const rateLimits = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
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
