import { prisma } from '../config/db';
import { Comparable, SearchParams, ParcelLookupResult } from '../domain/types';
import { Decimal } from '@prisma/client/runtime/library';

function toNumber(val: Decimal | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  return Number(val.toString());
}

function mapToComparable(row: {
  id: string;
  parcelNumber: string;
  lat: number;
  lng: number;
  areaHa: Decimal;
  salePrice: Decimal | null;
  saleDate: Date;
  locality: string;
  county: string;
  notes: string | null;
  distanceM?: number;
}): Comparable {
  const areaHa = Number(row.areaHa.toString());
  const salePrice = toNumber(row.salePrice);
  return {
    id: row.id,
    parcelNumber: row.parcelNumber,
    areaHa,
    salePrice,
    pricePerHa: salePrice !== null ? Math.round(salePrice / areaHa) : null,
    saleDate: row.saleDate,
    locality: row.locality,
    county: row.county,
    notes: row.notes,
    coordinates: [row.lng, row.lat],
    distanceM: row.distanceM,
    hidden: false,
  };
}

export const comparableRepo = {
  async searchByRadius(params: SearchParams): Promise<Comparable[]> {
    const radiusMeters = params.radiusKm * 1000;

    // Raw SQL for PostGIS — Prisma ORM cannot express ST_DWithin
    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        parcel_number: string;
        lat: number;
        lng: number;
        area_ha: Decimal;
        sale_price: Decimal | null;
        sale_date: Date;
        locality: string;
        county: string;
        notes: string | null;
        distance_m: number;
      }>
    >`
      SELECT
        id,
        parcel_number,
        lat,
        lng,
        area_ha,
        sale_price,
        sale_date,
        locality,
        county,
        notes,
        ST_Distance(
          ST_MakePoint(lng, lat)::geography,
          ST_MakePoint(${params.lng}, ${params.lat})::geography
        ) AS distance_m
      FROM comparables
      WHERE
        deleted_at IS NULL
        AND ST_DWithin(
          ST_MakePoint(lng, lat)::geography,
          ST_MakePoint(${params.lng}, ${params.lat})::geography,
          ${radiusMeters}
        )
      ORDER BY distance_m ASC
      LIMIT 50
    `;

    return rows.map((r) =>
      mapToComparable({
        id: r.id,
        parcelNumber: r.parcel_number,
        lat: r.lat,
        lng: r.lng,
        areaHa: r.area_ha,
        salePrice: r.sale_price,
        saleDate: r.sale_date,
        locality: r.locality,
        county: r.county,
        notes: r.notes,
        distanceM: Math.round(r.distance_m),
      }),
    );
  },

  async findByParcelNumber(parcelNumber: string): Promise<ParcelLookupResult | null> {
    const row = await prisma.comparable.findFirst({
      where: { parcelNumber, deletedAt: null },
      select: { areaHa: true, lat: true, lng: true },
    });
    if (!row) return null;
    return { areaHa: Number(row.areaHa.toString()), lat: row.lat, lng: row.lng };
  },

  async findById(id: string): Promise<Comparable | null> {
    const row = await prisma.comparable.findFirst({ where: { id, deletedAt: null } });
    if (!row) return null;
    return mapToComparable(row);
  },

  async create(data: {
    parcelNumber: string;
    lat: number;
    lng: number;
    areaHa: number;
    salePrice?: number;
    saleDate: Date;
    locality: string;
    county: string;
    notes?: string;
    addedById?: string;
  }): Promise<Comparable> {
    const row = await prisma.comparable.create({ data });
    return mapToComparable(row);
  },

  async update(id: string, data: Partial<{
    parcelNumber: string;
    lat: number;
    lng: number;
    areaHa: number;
    salePrice: number | null;
    saleDate: Date;
    locality: string;
    county: string;
    notes: string | null;
  }>): Promise<Comparable> {
    const row = await prisma.comparable.update({ where: { id }, data });
    return mapToComparable(row);
  },

  async softDelete(id: string): Promise<void> {
    await prisma.comparable.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  async list(params: { page: number; limit: number; county?: string; search?: string }): Promise<{ comparables: Comparable[]; total: number }> {
    const { page, limit, county, search } = params;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(county ? { county } : {}),
      ...(search ? { parcelNumber: { contains: search, mode: 'insensitive' as const } } : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.comparable.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.comparable.count({ where }),
    ]);

    return { comparables: rows.map(mapToComparable), total };
  },

  async totalCount(): Promise<number> {
    return prisma.comparable.count({ where: { deletedAt: null } });
  },

  async bulkCreate(items: Array<{
    parcelNumber: string;
    lat: number;
    lng: number;
    areaHa: number;
    salePrice?: number;
    saleDate: Date;
    locality: string;
    county: string;
    notes?: string;
    addedById?: string;
  }>): Promise<number> {
    const result = await prisma.comparable.createMany({ data: items, skipDuplicates: true });
    return result.count;
  },
};
