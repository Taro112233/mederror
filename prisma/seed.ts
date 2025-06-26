import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed Severity
  const severities = [
    { code: 'A', label: 'A - ไม่มีอันตราย' },
    { code: 'B', label: 'B - เกือบเกิดอันตราย' },
    { code: 'C', label: 'C - เกิดอันตรายเล็กน้อย' },
    { code: 'D', label: 'D - เกิดอันตรายรุนแรง' },
    { code: 'E', label: 'E - ต้องบำบัดรักษา' },
    { code: 'F', label: 'F - ต้อง Admit / พักรักษาในโรงพยาบาลนานขึ้น' },
    { code: 'G', label: 'G - ต้องพิการ' },
    { code: 'H', label: 'H - ต้องการปั๊มหัวใจ / เข้ารับการผ่าตัด' },
    { code: 'I', label: 'I - เสียชีวิต' },
  ];
  for (const s of severities) {
    await prisma.severity.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    });
  }

  // Seed ErrorType & SubErrorType
  const errorTypes = [
    {
      code: 'PRESCRIBING',
      label: 'การสั่งยา',
      subErrorTypes: [
        { code: 'UNSPECIFIED_STRENGTH', label: 'ไม่ระบุความแรงของยา / ความแรงไม่ถูกต้อง' },
        { code: 'UNSPECIFIED_FORM', label: 'ไม่ระบุรูปแบบยา / ระบุรูปแบบยาผิด' },
        { code: 'UNSPECIFIED_QUANTITY', label: 'ไม่ได้ระบุจำนวนยาที่ต้องการ' },
        { code: 'UNSPECIFIED_USAGE', label: 'ไม่ได้ระบุวิธีใช้' },
        { code: 'INCORRECT_DOSAGE', label: 'วิธีใช้ที่ระบุมากกว่า / น้อยกว่าขนาดที่ใช้โดยทั่วไป' },
        { code: 'CHANGED_USAGE_FROM_PREVIOUS', label: 'วิธีใช้ที่ระบุเปลี่ยนแปลงจากเดิมที่เคยได้รับ' },
        { code: 'NAME_MISMATCH', label: 'ชื่อในใบสั่งยาไม่ตรงกับชื่อผู้ป่วย' },
        { code: 'DUPLICATE_SAME_PRESCRIPTION', label: 'ได้รับยาซ้ำซ้อนจากใบสั่งยาเดียวกัน' },
        { code: 'DUPLICATE_DIFFERENT_CLINIC', label: 'ได้รับยาซ้ำซ้อนจากต่างคลินิกกัน' },
        { code: 'INCORRECT_DRUG_NAME', label: 'ระบุชื่อยาผิด' },
        { code: 'DRUG_NOT_AVAILABLE', label: 'สั่งยาที่ไม่มีในโรงพยาบาล' },
        { code: 'TWO_STRENGTHS_SAME_PRESCRIPTION', label: 'สั่งยา 2 ความแรงในใบสั่งยาเดียวกัน' },
        { code: 'ABNORMAL_QUANTITY', label: 'จำนวนยาที่แพทย์สั่งมากหรือน้อยผิดปกติ' },
        { code: 'CANNOT_ADMINISTER', label: 'ไม่สามารถบริหารยาตามขนาดหรือวิธีที่แพทย์สั่งได้' },
        { code: 'UNCLEAR_INSTRUCTION', label: 'คำสั่งใช้ยาไม่ชัดเจน / อ่านไม่ออก' },
        { code: 'NON_STANDARD_ABBREVIATION', label: 'ใช้คำย่อไม่สากลหรือไม่เข้าใจคำย่อ' },
        { code: 'ALLERGY_HISTORY', label: 'ผู้ป่วยเคยแพ้ยาที่แพทย์สั่ง' },
        { code: 'DRUG_INTERACTION', label: 'อาจเกิด drug interaction ได้' },
        { code: 'RESTRICTED_DRUG', label: 'สั่งยาที่มีเงื่อนไขการสั่งใช้' },
        { code: 'CONTRAINDICATED_PREGNANCY', label: 'สั่งยาห้ามใช้ในหญิงตั้งครรภ์ / ให้นมบุตร' },
        { code: 'OMITTED_NECESSARY_DRUG', label: 'ไม่ได้สั่งยาที่ผู้ป่วยสมควรได้รับ' },
        { code: 'INCORRECT_FOR_DISEASE', label: 'สั่งยาไม่ตรงกับโรค' },
        { code: 'PATIENT_REFUSED', label: 'ผู้ป่วยปฏิเสธรับยา' },
        { code: 'LACK_LAB_INFO', label: 'สั่งยาโดยขาดข้อมูลผลตรวจทางห้องปฏิบัติการที่จำเป็นตามแนวทางที่กำหนด' },
        { code: 'CONTRAINDICATED_OR_WARNING', label: 'สั่งยาในผู้ป่วยที่มีข้อห้ามใช้ / ข้อควรระวัง' },
      ],
    },
    {
      code: 'TRANSCRIPTION',
      label: 'การคัดลอกคำสั่งใช้ยา',
      subErrorTypes: [
        { code: 'INCORRECT_TYPE', label: 'ผิดชนิด' },
        { code: 'INCORRECT_QUANTITY', label: 'จำนวนไม่ถูกต้อง' },
        { code: 'INCOMPLETE_ITEMS', label: 'รายการไม่ครบตามแพทย์สั่ง' },
        { code: 'INCORRECT_STRENGTH', label: 'ผิดความแรง' },
        { code: 'INCORRECT_LABEL', label: 'พิมพ์ฉลากยาผิด' },
        { code: 'INCORRECT_FORM', label: 'ผิดรูปแบบ' },
        { code: 'INCORRECT_USAGE', label: 'วิธีใช้ไม่ถูกต้อง' },
        { code: 'INCORRECT_DOSAGE', label: 'ผิดขนาด' },
        { code: 'COPIED_UNORDERED_DRUG', label: 'คัดลอกยาที่แพทย์ไม่ได้สั่ง / หยุดการสั่ง' },
        { code: 'NOT_SENT_COPY_ORDER', label: 'ไม่ได้ฉีก Copy Order ส่งห้องยา' },
        { code: 'INCORRECT_PERSON', label: 'ผิดคน' },
      ],
    },
    {
      code: 'PRE_DISPENSING',
      label: 'การจัดยาตามใบสั่งแพทย์',
      subErrorTypes: [
        { code: 'INCORRECT_TYPE', label: 'ผิดชนิด' },
        { code: 'INCORRECT_QUANTITY', label: 'จำนวนไม่ถูกต้อง' },
        { code: 'INCOMPLETE_ITEMS', label: 'รายการไม่ครบตามแพทย์สั่ง' },
        { code: 'INCORRECT_STRENGTH', label: 'ผิดความแรง' },
        { code: 'INCORRECT_LABEL', label: 'พิมพ์ฉลากยาผิด' },
        { code: 'INCORRECT_FORM', label: 'ผิดรูปแบบ' },
        { code: 'MIXED_WITH_OTHER_PATIENT', label: 'จัดยาปะปนกันกับผู้ป่วยรายอื่น' },
        { code: 'INCORRECT_DOSAGE', label: 'ผิดขนาด' },
        { code: 'EXPIRED_OR_DETERIORATED', label: 'ยาหมดอายุ / เสื่อมสภาพ' },
        { code: 'MIXED_DRUGS', label: 'ยาปะปนกัน' },
        { code: 'INCORRECT_PATIENT_MATCH', label: 'จับคู่ใบสั่งยาผิดคน' },
      ],
    },
    {
      code: 'DISPENSING',
      label: 'การจ่ายยา',
      subErrorTypes: [
        { code: 'INCORRECT_TYPE', label: 'ผิดชนิด' },
        { code: 'INCORRECT_FORM', label: 'ผิดรูปแบบ' },
        { code: 'INCORRECT_STRENGTH', label: 'ผิดความแรง' },
        { code: 'INCORRECT_QUANTITY', label: 'จำนวนไม่ถูกต้อง' },
        { code: 'INCOMPLETE_ITEMS', label: 'รายการไม่ครบตามแพทย์สั่ง / ไม่ได้จ่ายยา' },
        { code: 'INCORRECT_OR_MISSING_LABEL', label: 'ฉลากไม่ถูกต้อง / ไม่มีฉลาก' },
        { code: 'INCORRECT_PERSON_OR_MIXED', label: 'ผิดคน / ยาผู้ป่วยปนกัน' },
        { code: 'UNORDERED_DRUG', label: 'จ่ายยาที่แพทย์ไม่ได้สั่ง / หยุดการสั่ง' },
        { code: 'INCORRECT_USAGE', label: 'วิธีใช้ไม่ถูกต้องตามแพทย์สั่ง' },
        { code: 'DUPLICATE_DRUG', label: 'จ่ายยาซ้ำ' },
        { code: 'INCORRECT_DOSAGE', label: 'ขนาดยาไม่ถูกต้องตามแพทย์สั่ง' },
        { code: 'DELAYED_DISPENSING', label: 'จ่ายยาล่าช้าเกินเวลาที่กำหนด' },
        { code: 'EXPIRED_OR_DETERIORATED', label: 'จ่ายยาหมดอายุ / เสื่อมสภาพ' },
        { code: 'INCORRECT_LOCKER', label: 'จ่ายยาผิดช่องลงล็อคยา' },
      ],
    },
    {
      code: 'ADMINISTRATION',
      label: 'การบริหารยาแก่ผู้ป่วย',
      subErrorTypes: [
        { code: 'INCORRECT_PERSON', label: 'ผิดคน' },
        { code: 'INCORRECT_TYPE', label: 'ผิดชนิด (ตัวยา / สารน้ำผิดชนิด)' },
        { code: 'INCORRECT_DOSAGE_OR_STRENGTH', label: 'ผิดขนาด / ความแรง / ความเข้มข้น' },
        { code: 'DUPLICATE_OR_UNORDERED_DRUG', label: 'ให้ยาซ้ำ / ให้ยาที่แพทย์ไม่ได้สั่ง / หยุดการสั่ง' },
        { code: 'INCORRECT_OR_MISSED_TIME', label: 'ผิดเวลาเกินกว่า 1 ชม. / ไม่ได้ให้ยา' },
        { code: 'INCORRECT_ROUTE_OR_SIDE', label: 'วิถีทางบริหารยาผิด / ผิดข้าง' },
        { code: 'INCORRECT_TECHNIQUE', label: 'ผิดเทคนิค' },
        { code: 'ALLERGY_OR_CONTRAINDICATION', label: 'ให้ยาที่ผู้ป่วยมีประวัติแพ้ยา / ผู้ป่วยมีข้อห้ามใช้' },
        { code: 'INCORRECT_USAGE', label: 'วิธีใช้ไม่ถูกต้องตามแพทย์สั่ง' },
        { code: 'EXPIRED_OR_UNSTABLE', label: 'ให้ยาที่หมดอายุ / ไม่มีความคงตัวแล้ว' },
      ],
    },
  ];

  for (const et of errorTypes) {
    const errorType = await prisma.errorType.upsert({
      where: { code: et.code },
      update: {},
      create: { code: et.code, label: et.label },
    });
    for (const sub of et.subErrorTypes) {
      await prisma.subErrorType.upsert({
        where: { code: sub.code },
        update: {},
        create: { ...sub, errorTypeId: errorType.id },
      });
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect()); 