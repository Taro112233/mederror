import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed Organization
  let org = await prisma.organization.findFirst({ where: { name: 'โรงพยาบาลทดสอบ' } });
  if (!org) {
    org = await prisma.organization.create({ data: { name: 'โรงพยาบาลทดสอบ' } });
  }

  // Seed Accounts & Users
  const accountsData = [
    { username: 'dev', role: 'DEVELOPER' as const, name: 'Dev User', position: 'Developer', phone: '0800000001' },
    { username: 'admin', role: 'ADMIN' as const, name: 'Admin User', position: 'Admin', phone: '0800000002' },
    { username: 'user1', role: 'USER' as const, name: 'User One', position: 'Pharmacist', phone: '0800000003' },
    { username: 'user2', role: 'USER' as const, name: 'User Two', position: 'Nurse', phone: '0800000004' },
    { username: 'unapproved', role: 'UNAPPROVED' as const, name: 'Unapproved User', position: 'Intern', phone: '0800000005' },
  ];
  const password = 'test1234';
  const passwordHash = await bcrypt.hash(password, 10);
  
  for (const acc of accountsData) {
    await prisma.account.upsert({
      where: { organizationId_username: { organizationId: org.id, username: acc.username } },
      update: {},
      create: {
        username: acc.username,
        passwordHash,
        onboarded: true,
        role: acc.role,
        organizationId: org.id,
        user: {
          create: {
            name: acc.name,
            position: acc.position,
            phone: acc.phone,
          },
        },
      },
    });
  }
  
  // ดึง accounts ใหม่พร้อม user
  const accounts = await prisma.account.findMany({ 
    where: { organizationId: org.id }, 
    include: { user: true } 
  });

  // Prepare for MedError seeding
  const severities = await prisma.severity.findMany();
  const errorTypes = await prisma.errorType.findMany({ include: { subErrorTypes: true } });
  const units = await prisma.unit.findMany();

  // Only allow reporter from dev, admin, user1, user2
  const reporterAccounts = accounts.filter((a: any) => a.role !== 'UNAPPROVED');

  // Helper for random date in last 90 days
  function randomDate() {
    const now = new Date();
    const past = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
  }

  // Seed 85 MedError
  for (let i = 0; i < 85; i++) {
    const reporter = reporterAccounts[Math.floor(Math.random() * reporterAccounts.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    const subErrorType = errorType.subErrorTypes[Math.floor(Math.random() * errorType.subErrorTypes.length)];
    const unit = units[Math.floor(Math.random() * units.length)];
    const eventDate = randomDate();
    
    await prisma.medError.create({
      data: {
        eventDate,
        unitId: unit.id,
        description: `กรณีทดสอบที่ ${i + 1}`,
        severityId: severity.id,
        errorTypeId: errorType.id,
        subErrorTypeId: subErrorType.id,
        reporterAccountId: reporter.id,
        reporterUsername: reporter.username,
        reporterName: reporter.user?.name || '',
        reporterPosition: reporter.user?.position || '',
        reporterPhone: reporter.user?.phone || '',
        reporterOrganizationId: org.id,
      },
    });
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect()); 