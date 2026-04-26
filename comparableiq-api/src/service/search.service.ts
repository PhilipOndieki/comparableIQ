import { redis } from '../config/redis';
import { env } from '../config/env';
import { comparableRepo } from '../repository/comparable.repo';
import { userRepo } from '../repository/user.repo';
import { auditRepo } from '../repository/audit.repo';
import { SearchLimitError } from '../domain/errors';
import { Comparable, SearchParams, SearchResult, UserRole, AuditAction, ParcelLookupResult } from '../domain/types';
import { NAIROBI_TZ } from '../domain/constants';
import { logger } from '../domain/logger';

function getMidnightNairobi(): Date {
  const now = new Date();
  const nairobiStr = now.toLocaleString('en-KE', { timeZone: NAIROBI_TZ });
  const nairobiDate = new Date(nairobiStr);
  nairobiDate.setHours(0, 0, 0, 0);
  return nairobiDate;
}

function hideComparable(comp: Comparable): Comparable {
  return {
    ...comp,
    parcelNumber: '****',
    salePrice: null,
    pricePerHa: null,
    notes: null,
    hidden: true,
  };
}

function buildCacheKey(params: SearchParams): string {
  const lat = params.lat.toFixed(2);
  const lng = params.lng.toFixed(2);
  return `search:${lat}:${lng}:${params.radiusKm}:${params.areaHa}`;
}

export const searchService = {
  async search(
    params: SearchParams,
    userId: string | undefined,
    userRole: UserRole | undefined,
    ipAddress: string,
  ): Promise<SearchResult> {
    const isAnonymous = !userId;
    const isGoogleUser = userRole === UserRole.GOOGLE_USER;

    if (isGoogleUser && userId) {
      const user = await userRepo.findById(userId);
      if (user) {
        const midnight = getMidnightNairobi();
        if (user.searchCountResetAt < midnight) {
          await userRepo.resetSearchCount(userId);
        }

        const fresh = await userRepo.findById(userId);
        if (fresh && fresh.searchCountToday >= env.MAX_DAILY_SEARCHES) {
          throw new SearchLimitError();
        }
      }
    }

    const cacheKey = buildCacheKey(params);
    let comparables: Comparable[] | null = null;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        comparables = JSON.parse(cached) as Comparable[];
      }
    } catch (err) {
      logger.warn('Redis cache read failed', { error: err });
    }

    if (!comparables) {
      comparables = await comparableRepo.searchByRadius(params);
      try {
        await redis.setex(cacheKey, env.SEARCH_CACHE_TTL_SECONDS, JSON.stringify(comparables));
      } catch (err) {
        logger.warn('Redis cache write failed', { error: err });
      }
    }

    if (userId) {
      await userRepo.incrementSearchCount(userId);
    }

    await auditRepo.log({
      userId,
      action: AuditAction.SEARCH,
      metadata: {
        lat: params.lat,
        lng: params.lng,
        radiusKm: params.radiusKm,
        areaHa: params.areaHa,
        parcelNumber: params.parcelNumber,
        resultCount: comparables.length,
        role: userRole ?? 'anonymous',
      },
      ipAddress,
    });

    const shouldHide = isAnonymous || isGoogleUser;
    const visibleComparables = shouldHide ? comparables.map(hideComparable) : comparables;

    return {
      comparables: visibleComparables,
      total: comparables.length,
      hidden: shouldHide,
    };
  },

  async parcelLookup(parcelNumber: string): Promise<ParcelLookupResult | null> {
    const cacheKey = `parcel:${parcelNumber.toLowerCase().replace(/\s/g, '')}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as ParcelLookupResult;
    } catch {
      // degraded
    }

    const result = await comparableRepo.findByParcelNumber(parcelNumber);
    if (!result) return null;

    try {
      await redis.setex(cacheKey, env.PARCEL_CACHE_TTL_SECONDS, JSON.stringify(result));
    } catch {
      // degraded
    }

    return result;
  },
};
