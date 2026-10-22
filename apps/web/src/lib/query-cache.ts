import type { QueryClient } from '@tanstack/react-query';

/**
 * Clear private query state on every authentication boundary transition.
 * Owner-scoped query keys provide a second isolation boundary, but must never
 * be treated as a reason to retain another session's private cache.
 */
export function clearAuthQueryCache(cache: QueryClient): void {
  cache.clear();
}
