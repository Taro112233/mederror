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

  // Debug: ดูข้อมูลที่ query มา
  console.log('🔍 Debug: ErrorTypes และ SubErrorTypes ที่มีในฐานข้อมูล:');
  errorTypes.forEach(et => {
    console.log(`  ${et.code}: ${et.subErrorTypes.map(s => s.code).join(', ')}`);
  });

  // Only allow reporter from dev, admin, user1, user2
  const reporterAccounts = accounts.filter((a: any) => a.role !== 'UNAPPROVED');

  // Helper for random date in last 10 months
  function randomDate10Months() {
    const now = new Date();
    const past = new Date(now.getTime() - 300 * 24 * 60 * 60 * 1000); // ~10 months
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
  }

  // Template กรณีทดสอบที่สัมพันธ์กัน
  const medErrorTemplates = [
    // PRESCRIBING
    {
      description: "แพทย์สั่งยาขาดจำนวนใน OPD ทำให้เจ้าหน้าที่ต้องติดต่อสอบถามแพทย์ก่อนจ่ายยา ",
      errorTypeCode: "PRESCRIBING",
      subErrorTypeCode: "UNSPECIFIED_QUANTITY",
      severityCode: "B",
      unitCode: "OPD"
    },
    {
      description: "แพทย์สั่งยาที่ไม่มีในคลังของโรงพยาบาลที่ OPD ทำให้ต้องแจ้งเปลี่ยนแปลงรายการยาและใช้เวลาติดต่อประสานงานกับแพทย์เพื่อหายาทดแทน ผู้ป่วยต้องรอรับยานานกว่าปกติ ",
      errorTypeCode: "PRESCRIBING",
      subErrorTypeCode: "DRUG_NOT_AVAILABLE",
      severityCode: "B",
      unitCode: "OPD"
    },
    {
      description: "แพทย์สั่งยาผิดชื่อในหอผู้ป่วยเด็ก โดยระบุชื่อยาผิดจากที่ต้องการจริง ส่งผลให้เจ้าหน้าที่จัดยาผิดชนิดและต้องเรียกคืนยา ",
      errorTypeCode: "PRESCRIBING",
      subErrorTypeCode: "INCORRECT_DRUG_NAME",
      severityCode: "B",
      unitCode: "PEDWARD"
    },
    {
      description: "แพทย์สั่งยาโดยขาดข้อมูลวิธีใช้ใน OPD ทำให้เจ้าหน้าที่ไม่สามารถให้คำแนะนำผู้ป่วยได้อย่างถูกต้อง ต้องติดต่อสอบถามแพทย์ก่อนจ่ายยา ",
      errorTypeCode: "PRESCRIBING",
      subErrorTypeCode: "UNSPECIFIED_USAGE",
      severityCode: "B",
      unitCode: "OPD"
    },
    {
      description: "แพทย์สั่งยาห้ามใช้ในหญิงตั้งครรภ์ที่ OPD โดยไม่ได้ตรวจสอบสถานะการตั้งครรภ์ของผู้ป่วย ส่งผลให้ต้องเปลี่ยนแปลงแผนการรักษาและแจ้งเตือนทีมแพทย์ ",
      errorTypeCode: "PRESCRIBING",
      subErrorTypeCode: "CONTRAINDICATED_PREGNANCY",
      severityCode: "D",
      unitCode: "OPD"
    },
    {
      description: "แพทย์สั่งยาโดยใช้คำย่อไม่สากลในใบสั่งยาที่ห้องไตเทียม ทำให้เจ้าหน้าที่เข้าใจผิดและจัดยาผิดชนิด ",
      errorTypeCode: "PRESCRIBING",
      subErrorTypeCode: "NON_STANDARD_ABBREVIATION",
      severityCode: "B",
      unitCode: "DIALYSIS"
    },
    {
      description: "แพทย์สั่งยาที่ผู้ป่วยเคยแพ้ในห้องไตเทียม โดยไม่ได้ตรวจสอบประวัติการแพ้ยาในระบบ ส่งผลให้ผู้ป่วยมีอาการผื่นคันและต้องหยุดใช้ยา ",
      errorTypeCode: "PRESCRIBING",
      subErrorTypeCode: "ALLERGY_HISTORY",
      severityCode: "F",
      unitCode: "DIALYSIS"
    },
    {
      description: "แพทย์สั่งยาไม่ตรงกับโรคในหอผู้ป่วยอายุรกรรม ทำให้ผู้ป่วยไม่ได้รับการรักษาที่เหมาะสม ต้องมีการปรึกษาแพทย์เฉพาะทางและปรับแผนการรักษาใหม่ ",
      errorTypeCode: "PRESCRIBING",
      subErrorTypeCode: "INCORRECT_FOR_DISEASE",
      severityCode: "C",
      unitCode: "MEDWARD"
    },
    {
      description: "แพทย์สั่งยาโดยขาดข้อมูลผลตรวจทางห้องปฏิบัติการที่จำเป็นในหอผู้ป่วยอายุรกรรม ส่งผลให้ผู้ป่วยได้รับยาไม่เหมาะสมกับสภาวะไต ต้องมีการปรับขนาดยาใหม่หลังผลแลปออก ",
      errorTypeCode: "PRESCRIBING",
      subErrorTypeCode: "LACK_LAB_INFO",
      severityCode: "C",
      unitCode: "MEDWARD"
    },
    {
      description: "ผู้ป่วยได้รับยาซ้ำซ้อนจากต่างคลินิกใน OPD เนื่องจากแพทย์ทั้งสองคลินิกสั่งยาแก้ปวดชนิดเดียวกันโดยไม่ทราบข้อมูลซึ่งกันและกัน ส่งผลให้ผู้ป่วยได้รับยาเกินขนาดและมีอาการข้างเคียง ",
      errorTypeCode: "PRESCRIBING",
      subErrorTypeCode: "DUPLICATE_DIFFERENT_CLINIC",
      severityCode: "C",
      unitCode: "OPD"
    },
    // TRANSCRIPTION
    {
      description: "เจ้าหน้าที่คัดลอกคำสั่งใช้ยาผิดจำนวนในหอผู้ป่วยอายุรกรรม โดยระบุจำนวนยาเกินจากที่แพทย์สั่งจริง ทำให้ผู้ป่วยได้รับยาเกินขนาด ต้องเฝ้าระวังอาการข้างเคียงอย่างใกล้ชิด ",
      errorTypeCode: "TRANSCRIPTION",
      subErrorTypeCode: "INCORRECT_QUANTITY",
      severityCode: "C",
      unitCode: "MEDWARD"
    },
    {
      description: "เจ้าหน้าที่พิมพ์ฉลากยาผิดในหอผู้ป่วยพิเศษ โดยระบุชื่อยาผิดจากที่แพทย์สั่ง ทำให้ผู้ป่วยเกือบได้รับยาผิด โชคดีที่เภสัชกรตรวจสอบพบก่อนจ่ายยา ",
      errorTypeCode: "TRANSCRIPTION",
      subErrorTypeCode: "INCORRECT_LABEL",
      severityCode: "B",
      unitCode: "SPECIALWARD"
    },
    {
      description: "เจ้าหน้าที่คัดลอกคำสั่งใช้ยาผิดคนในหอผู้ป่วยศัลยกรรม โดยนำใบสั่งยาของผู้ป่วยเตียงข้างเคียงไปคัดลอกแทน ส่งผลให้ผู้ป่วยได้รับยาผิด ต้องหยุดการให้ยาและติดตามอาการอย่างใกล้ชิด ",
      errorTypeCode: "TRANSCRIPTION",
      subErrorTypeCode: "INCORRECT_PERSON",
      severityCode: "D",
      unitCode: "SURGWARD"
    },
    {
      description: "เจ้าหน้าที่คัดลอกคำสั่งใช้ยาผิดรายการในหอผู้ป่วยเด็ก โดยไม่ได้คัดลอกยาทั้งหมดตามที่แพทย์สั่ง ส่งผลให้ผู้ป่วยไม่ได้รับยาครบถ้วน ต้องมีการติดตามและคัดลอกคำสั่งยาใหม่ ",
      errorTypeCode: "TRANSCRIPTION",
      subErrorTypeCode: "INCOMPLETE_ITEMS",
      severityCode: "C",
      unitCode: "PEDWARD"
    },
    // PRE_DISPENSING
    {
      description: "เจ้าหน้าที่จัดยาปะปนกันในหอผู้ป่วยเด็ก ส่งผลให้ผู้ป่วยสองรายได้รับยาสลับกัน โชคดีที่ตรวจพบก่อนให้ยาแก่ผู้ป่วย ",
      errorTypeCode: "PRE_DISPENSING",
      subErrorTypeCode: "MIXED_WITH_OTHER_PATIENT",
      severityCode: "D",
      unitCode: "PEDWARD"
    },
    {
      description: "เจ้าหน้าที่จัดยาหมดอายุในเภสัชกรรมโดยไม่ได้ตรวจสอบวันหมดอายุ ส่งผลให้ต้องเรียกคืนยาและแจ้งเตือนผู้ป่วยที่ได้รับยาไปแล้ว ",
      errorTypeCode: "PRE_DISPENSING",
      subErrorTypeCode: "EXPIRED_OR_DETERIORATED",
      severityCode: "B",
      unitCode: "PHARMACY"
    },
    // DISPENSING
    {
      description: "เจ้าหน้าที่จ่ายยาล่าช้าเกินเวลาที่กำหนดในห้องฉุกเฉิน เนื่องจากระบบคอมพิวเตอร์ขัดข้อง ทำให้ผู้ป่วยต้องรอรับยานานกว่าปกติและเกิดความไม่พอใจ ",
      errorTypeCode: "DISPENSING",
      subErrorTypeCode: "DELAYED_DISPENSING",
      severityCode: "E",
      unitCode: "ER"
    },
    {
      description: "เจ้าหน้าที่จ่ายยาผิดช่องลงล็อคยาในเภสัชกรรม ทำให้ผู้ป่วยได้รับยาผิดชนิด ต้องเรียกคืนยาและจ่ายยาใหม่ ",
      errorTypeCode: "DISPENSING",
      subErrorTypeCode: "INCORRECT_LOCKER",
      severityCode: "C",
      unitCode: "PHARMACY"
    },
    // ADMINISTRATION
    {
      description: "พยาบาลให้ยาผิดขนาดกับผู้ป่วยใน ICU ส่งผลให้ผู้ป่วยมีอาการความดันโลหิตลดลงอย่างรวดเร็ว ต้องได้รับการดูแลอย่างใกล้ชิดและปรับขนาดยาใหม่ทันที เหตุการณ์นี้เกิดจากการอ่านฉลากยาไม่ชัดเจนและรีบเร่งในช่วงเปลี่ยนเวร มีการประชุมทีมเพื่อเน้นย้ำการตรวจสอบซ้ำก่อนให้ยา.",
      errorTypeCode: "ADMINISTRATION",
      subErrorTypeCode: "INCORRECT_DOSAGE_OR_STRENGTH",
      severityCode: "D",
      unitCode: "ICU"
    },
    {
      description: "พยาบาลให้ยาผิดเวลาในหอผู้ป่วยเด็ก โดยล่าช้ากว่ากำหนดมากกว่า 2 ชั่วโมง ส่งผลให้ประสิทธิภาพของยาลดลงและต้องปรับแผนการรักษาใหม่ ",
      errorTypeCode: "ADMINISTRATION",
      subErrorTypeCode: "INCORRECT_OR_MISSED_TIME",
      severityCode: "C",
      unitCode: "PEDWARD"
    },
    {
      description: "พยาบาลให้ยาผิดข้างในห้องผ่าตัด โดยหยอดตาซ้ายแทนตาขวาตามแผนการรักษา ส่งผลให้ต้องหยุดการรักษาและติดตามอาการผู้ป่วยอย่างใกล้ชิด ",
      errorTypeCode: "ADMINISTRATION",
      subErrorTypeCode: "INCORRECT_ROUTE_OR_SIDE",
      severityCode: "D",
      unitCode: "OR"
    },
    {
      description: "พยาบาลให้ยาที่ผู้ป่วยมีข้อห้ามใช้ในหอผู้ป่วยพิเศษ โดยไม่ได้ตรวจสอบประวัติการแพ้ยา ส่งผลให้ผู้ป่วยมีอาการแพ้รุนแรง ต้องได้รับการรักษาเร่งด่วน ",
      errorTypeCode: "ADMINISTRATION",
      subErrorTypeCode: "ALLERGY_OR_CONTRAINDICATION",
      severityCode: "F",
      unitCode: "SPECIALWARD"
    },
    {
      description: "พยาบาลให้ยาซ้ำในหอผู้ป่วยอายุรกรรม โดยให้ยาชนิดเดียวกันสองครั้งในช่วงเวลาใกล้เคียงกัน ส่งผลให้ผู้ป่วยมีอาการข้างเคียง ต้องหยุดการให้ยาและติดตามอาการอย่างใกล้ชิด ",
      errorTypeCode: "ADMINISTRATION",
      subErrorTypeCode: "DUPLICATE_OR_UNORDERED_DRUG",
      severityCode: "C",
      unitCode: "MEDWARD"
    },
    {
      description: "พยาบาลให้ยาผิดเทคนิคในห้องฉุกเฉิน โดยไม่ได้เปลี่ยนเข็มฉีดยาตามมาตรฐาน ส่งผลให้ผู้ป่วยมีอาการบวมและปวดบริเวณที่ฉีด ",
      errorTypeCode: "ADMINISTRATION",
      subErrorTypeCode: "INCORRECT_TECHNIQUE",
      severityCode: "D",
      unitCode: "ER"
    }
  ];

  // Helper สำหรับหา id จริงจาก code
  function findByCode(arr: any[], code: string) {
    return arr.find((item) => item.code === code);
  }

  // Seed 187 MedError
  for (let i = 0; i < 187; i++) {
    const template = medErrorTemplates[Math.floor(Math.random() * medErrorTemplates.length)];
    const errorType = findByCode(errorTypes, template.errorTypeCode);
    const subErrorType = errorType?.subErrorTypes.find((s: any) => s.code === template.subErrorTypeCode);
    const severity = findByCode(severities, template.severityCode);
    const unit = findByCode(units, template.unitCode);
    const reporter = reporterAccounts[Math.floor(Math.random() * reporterAccounts.length)];
    const eventDate = randomDate10Months();

    // ตรวจสอบว่าทุก entity มีจริง
    if (!errorType || !subErrorType || !severity || !unit) {
      console.warn('⚠️  Template mapping ไม่ครบ:', {
        description: template.description,
        errorType: !!errorType,
        subErrorType: !!subErrorType,
        severity: !!severity,
        unit: !!unit
      });
      continue;
    }

    await prisma.medError.create({
      data: {
        eventDate,
        unitId: unit.id,
        description: template.description,
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