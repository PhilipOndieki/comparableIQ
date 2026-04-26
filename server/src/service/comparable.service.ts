import { comparableRepo } from '../repository/comparable.repo';
import { auditRepo } from '../repository/audit.repo';
import { NotFoundError, ValidationError } from '../domain/errors';
import { Comparable, AuditAction } from '../domain/types';

interface CreateComparableInput {
  parcelNumber: string;
  lat: number;
  lng: number;
  areaHa: number;
  salePrice?: number;
  saleDate: Date;
  locality: string;
  county: string;
  notes?: string;
  addedById: string;
}

export const comparableService = {
  async create(input: CreateComparableInput, ipAddress: string): Promise<Comparable> {
    const comp = await comparableRepo.create(input);
    await auditRepo.log({
      userId: input.addedById,
      action: AuditAction.COMPARABLE_ADDED,
      metadata: { parcelNumber: comp.parcelNumber, county: comp.county },
      ipAddress,
    });
    return comp;
  },

  async update(
    id: string,
    data: Partial<Omit<CreateComparableInput, 'addedById'>>,
    userId: string,
    ipAddress: string,
  ): Promise<Comparable> {
    const existing = await comparableRepo.findById(id);
    if (!existing) throw new NotFoundError('Comparable');

    const updateData: Parameters<typeof comparableRepo.update>[1] = {};
    if (data.parcelNumber !== undefined) updateData.parcelNumber = data.parcelNumber;
    if (data.lat !== undefined) updateData.lat = data.lat;
    if (data.lng !== undefined) updateData.lng = data.lng;
    if (data.areaHa !== undefined) updateData.areaHa = data.areaHa;
    if (data.salePrice !== undefined) updateData.salePrice = data.salePrice;
    if (data.saleDate !== undefined) updateData.saleDate = data.saleDate;
    if (data.locality !== undefined) updateData.locality = data.locality;
    if (data.county !== undefined) updateData.county = data.county;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await comparableRepo.update(id, updateData);
    await auditRepo.log({
      userId,
      action: AuditAction.COMPARABLE_EDITED,
      metadata: { id, parcelNumber: updated.parcelNumber },
      ipAddress,
    });
    return updated;
  },

  async softDelete(id: string, userId: string, ipAddress: string): Promise<void> {
    const existing = await comparableRepo.findById(id);
    if (!existing) throw new NotFoundError('Comparable');

    await comparableRepo.softDelete(id);
    await auditRepo.log({
      userId,
      action: AuditAction.COMPARABLE_DELETED,
      metadata: { id, parcelNumber: existing.parcelNumber },
      ipAddress,
    });
  },

  async bulkCreate(
    rows: string,
    addedById: string,
    ipAddress: string,
  ): Promise<{ created: number; errors: string[] }> {
    const lines = rows.trim().split('\n').slice(1); // skip header
    const errors: string[] = [];
    const items: Parameters<typeof comparableRepo.bulkCreate>[0] = [];

    lines.forEach((line, i) => {
      const [parcelNumber, lat, lng, areaHa, salePrice, saleDate, locality, county, notes] =
        line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));

      if (!parcelNumber || !lat || !lng || !areaHa || !saleDate || !locality || !county) {
        errors.push(`Row ${i + 2}: missing required fields`);
        return;
      }

      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      const parsedArea = parseFloat(areaHa);
      const parsedPrice = salePrice ? parseFloat(salePrice) : undefined;
      const parsedDate = new Date(saleDate);

      if (isNaN(parsedLat) || isNaN(parsedLng) || isNaN(parsedArea)) {
        errors.push(`Row ${i + 2}: invalid numeric value`);
        return;
      }

      if (isNaN(parsedDate.getTime())) {
        errors.push(`Row ${i + 2}: invalid date format`);
        return;
      }

      items.push({
        parcelNumber,
        lat: parsedLat,
        lng: parsedLng,
        areaHa: parsedArea,
        ...(parsedPrice ? { salePrice: parsedPrice } : {}),
        saleDate: parsedDate,
        locality,
        county,
        ...(notes ? { notes } : {}),
        addedById,
      });
    });

    if (items.length === 0) throw new ValidationError('No valid rows to import');

    const created = await comparableRepo.bulkCreate(items);
    await auditRepo.log({
      userId: addedById,
      action: AuditAction.COMPARABLE_ADDED,
      metadata: { bulkImport: true, attempted: items.length, created },
      ipAddress,
    });

    return { created, errors };
  },
};
