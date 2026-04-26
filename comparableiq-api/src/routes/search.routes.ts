import { Router } from 'express';
import { searchHandler } from '../handler/search.handler';
import { optionalAuth } from '../middleware/auth';

export const searchRoutes = Router();

searchRoutes.get('/', optionalAuth, searchHandler.search);
searchRoutes.get('/parcel/:parcel_number', searchHandler.parcelLookup);
