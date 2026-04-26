import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { searchService } from '../service/search.service';
import { ValidationError } from '../domain/errors';
import { ApiResponse, SearchResult, ParcelLookupResult, UserRole } from '../domain/types';

const searchQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  area_ha: z.coerce.number().positive(),
  radius_km: z.coerce.number().min(0.1).max(50).default(3),
  parcel_number: z.string().optional(),
});

export const searchHandler = {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = searchQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.errors.map((e) => e.message).join('; '));
      }

      const { lat, lng, area_ha, radius_km, parcel_number } = parsed.data;

      const result = await searchService.search(
        { lat, lng, areaHa: area_ha, radiusKm: radius_km, parcelNumber: parcel_number },
        req.jwtUser?.sub,
        req.jwtUser?.role as UserRole | undefined,
        req.ip ?? 'unknown',
      );

      const tookMs = Date.now() - req.startTime;
      const response: ApiResponse<SearchResult> = {
        success: true,
        data: result,
        error: null,
        meta: { requestId: req.requestId, tookMs },
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async parcelLookup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parcelNumber = req.params['parcel_number'];
      if (!parcelNumber) throw new ValidationError('Parcel number is required');

      const result = await searchService.parcelLookup(decodeURIComponent(parcelNumber));
      const tookMs = Date.now() - req.startTime;

      const response: ApiResponse<ParcelLookupResult | null> = {
        success: true,
        data: result,
        error: null,
        meta: { requestId: req.requestId, tookMs },
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  },
};
