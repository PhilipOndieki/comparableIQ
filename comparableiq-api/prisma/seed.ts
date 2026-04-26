import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const COMPARABLES = [
  { parcelNumber: 'Kiambu/Ruiru/1001', lat: -1.1472, lng: 36.9609, areaHa: 0.5, salePrice: 4500000, saleDate: '2024-08-15', locality: 'Ruiru', county: 'Kiambu' },
  { parcelNumber: 'Kiambu/Ruiru/1102', lat: -1.1509, lng: 36.9634, areaHa: 0.8, salePrice: 7200000, saleDate: '2024-09-22', locality: 'Ruiru', county: 'Kiambu' },
  { parcelNumber: 'Kiambu/Thika/204', lat: -1.0332, lng: 37.0693, areaHa: 1.2, salePrice: 9600000, saleDate: '2024-07-10', locality: 'Thika', county: 'Kiambu' },
  { parcelNumber: 'Kiambu/Thika/512', lat: -1.0411, lng: 37.0721, areaHa: 2.1, salePrice: 15750000, saleDate: '2024-10-05', locality: 'Thika', county: 'Kiambu' },
  { parcelNumber: 'Nairobi/Westlands/88', lat: -1.2637, lng: 36.8102, areaHa: 0.25, salePrice: 18000000, saleDate: '2024-11-01', locality: 'Westlands', county: 'Nairobi' },
  { parcelNumber: 'Nairobi/Karen/301', lat: -1.3197, lng: 36.7017, areaHa: 0.5, salePrice: 35000000, saleDate: '2024-09-14', locality: 'Karen', county: 'Nairobi' },
  { parcelNumber: 'Nairobi/Langata/77', lat: -1.3383, lng: 36.7341, areaHa: 0.4, salePrice: 22000000, saleDate: '2024-08-30', locality: 'Lang\'ata', county: 'Nairobi' },
  { parcelNumber: 'Nakuru/Naivasha/55', lat: -0.7150, lng: 36.4338, areaHa: 3.0, salePrice: 12000000, saleDate: '2024-06-20', locality: 'Naivasha', county: 'Nakuru' },
  { parcelNumber: 'Nakuru/Nakuru/891', lat: -0.3031, lng: 36.0800, areaHa: 0.9, salePrice: 5400000, saleDate: '2024-10-18', locality: 'Nakuru Town', county: 'Nakuru' },
  { parcelNumber: 'Murang\'a/Kandara/14', lat: -0.9850, lng: 37.0230, areaHa: 1.5, salePrice: 6750000, saleDate: '2024-07-25', locality: 'Kandara', county: 'Murang\'a' },
  { parcelNumber: 'Murang\'a/Maragua/203', lat: -1.0112, lng: 37.1450, areaHa: 2.5, salePrice: 8750000, saleDate: '2024-11-10', locality: 'Maragua', county: 'Murang\'a' },
  { parcelNumber: 'Kajiado/Ngong/44', lat: -1.3640, lng: 36.6520, areaHa: 0.6, salePrice: 14400000, saleDate: '2024-09-05', locality: 'Ngong', county: 'Kajiado' },
  { parcelNumber: 'Kajiado/Kitengela/188', lat: -1.4762, lng: 36.9640, areaHa: 0.5, salePrice: 6000000, saleDate: '2024-08-12', locality: 'Kitengela', county: 'Kajiado' },
  { parcelNumber: 'Machakos/Athi River/99', lat: -1.4550, lng: 36.9780, areaHa: 1.0, salePrice: 8000000, saleDate: '2024-10-28', locality: 'Athi River', county: 'Machakos' },
  { parcelNumber: 'Kiambu/Kikuyu/302', lat: -1.2460, lng: 36.6680, areaHa: 0.75, salePrice: 9750000, saleDate: '2024-07-15', locality: 'Kikuyu', county: 'Kiambu' },
  { parcelNumber: 'Kiambu/Limuru/55', lat: -1.1010, lng: 36.6400, areaHa: 1.8, salePrice: 10800000, saleDate: '2024-09-30', locality: 'Limuru', county: 'Kiambu' },
  { parcelNumber: 'Nairobi/Kasarani/210', lat: -1.2276, lng: 36.8977, areaHa: 0.3, salePrice: 12000000, saleDate: '2024-11-15', locality: 'Kasarani', county: 'Nairobi' },
  { parcelNumber: 'Nairobi/Embakasi/134', lat: -1.3140, lng: 36.9020, areaHa: 0.25, salePrice: 8500000, saleDate: '2024-10-02', locality: 'Embakasi', county: 'Nairobi' },
  { parcelNumber: 'Nyeri/Nyeri/22', lat: -0.4167, lng: 36.9500, areaHa: 2.0, salePrice: 6000000, saleDate: '2024-08-05', locality: 'Nyeri Town', county: 'Nyeri' },
  { parcelNumber: 'Meru/Meru/501', lat: 0.0469, lng: 37.6500, areaHa: 1.5, salePrice: 4500000, saleDate: '2024-06-30', locality: 'Meru Town', county: 'Meru' },
];

async function main(): Promise<void> {
  console.log('Seeding database...');

  await prisma.user.upsert({
    where: { email: 'admin@comparableiq.co.ke' },
    update: {},
    create: {
      googleId: 'seed-admin-google-id',
      email: 'admin@comparableiq.co.ke',
      displayName: 'ComparableIQ Admin',
      role: UserRole.ADMIN,
      hasMapAccess: true,
    },
  });

  const admin = await prisma.user.findUnique({ where: { email: 'admin@comparableiq.co.ke' } });

  for (const comp of COMPARABLES) {
    const existing = await prisma.comparable.findFirst({
      where: { parcelNumber: comp.parcelNumber },
    });

    if (!existing) {
      await prisma.comparable.create({
        data: {
          parcelNumber: comp.parcelNumber,
          lat: comp.lat,
          lng: comp.lng,
          areaHa: comp.areaHa,
          salePrice: comp.salePrice,
          saleDate: new Date(comp.saleDate),
          locality: comp.locality,
          county: comp.county,
          addedById: admin?.id,
        },
      });
    }
  }

  console.log(`Seeded ${COMPARABLES.length} comparables`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
