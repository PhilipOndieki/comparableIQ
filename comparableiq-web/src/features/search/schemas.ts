import { z } from 'zod';

export const searchFormSchema = z.object({
  parcelNumber: z.string().optional(),
  areaHa: z.coerce.number().positive('Area must be a positive number'),
  radiusKm: z.coerce.number().min(0.1).max(50).default(3),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export type SearchFormValues = z.infer<typeof searchFormSchema>;
