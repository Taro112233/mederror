# ระบบการควบคุมสิทธิ์การเข้าถึง (Access Control)

## ภาพรวม

ระบบได้เพิ่มการควบคุมสิทธิ์การเข้าถึงสำหรับหน้า management ที่สำคัญ โดยเฉพาะหน้า "จัดการผู้ใช้" และ "ข้อมูลทั้งหมด" ให้เข้าถึงได้เฉพาะผู้ใช้ที่มี role เป็น **ADMIN** หรือ **DEVELOPER** เท่านั้น

## การเปลี่ยนแปลงที่สำคัญ

### 1. สร้าง useAuth Hook
- **ไฟล์**: `src/hooks/use-auth.ts`
- **หน้าที่**: จัดการการตรวจสอบสิทธิ์ผู้ใช้และ role
- **ฟีเจอร์**:
  - ตรวจสอบสถานะการเข้าสู่ระบบ
  - ตรวจสอบ role ของผู้ใช้
  - ให้ helper functions สำหรับตรวจสอบสิทธิ์

### 2. สร้าง AccessDenied Component
- **ไฟล์**: `src/components/AccessDenied.tsx`
- **หน้าที่**: แสดงหน้าเมื่อผู้ใช้ไม่มีสิทธิ์เข้าถึง
- **ฟีเจอร์**:
  - แสดงข้อความแจ้งเตือนที่เหมาะสม
  - มีปุ่มนำทางกลับไปหน้า Dashboard หรือหน้าแรก
  - UI ที่สวยงามและเป็นมิตรกับผู้ใช้

### 3. อัปเดตหน้า User Management
- **ไฟล์**: `src/app/management/user/page.tsx`
- **การเปลี่ยนแปลง**:
  - เพิ่มการตรวจสอบสิทธิ์ด้วย useAuth hook
  - แสดง AccessDenied component เมื่อไม่มีสิทธิ์
  - แสดง loading state ขณะตรวจสอบสิทธิ์

### 4. อัปเดตหน้า Records Management
- **ไฟล์**: `src/app/management/records/page.tsx`
- **การเปลี่ยนแปลง**:
  - เพิ่มการตรวจสอบสิทธิ์ด้วย useAuth hook
  - แสดง AccessDenied component เมื่อไม่มีสิทธิ์
  - แสดง loading state ขณะตรวจสอบสิทธิ์

### 5. อัปเดต GlobalSidebar
- **ไฟล์**: `src/components/GlobalSidebar.tsx`
- **การเปลี่ยนแปลง**:
  - ใช้ useAuth hook แทนการ fetch ข้อมูลผู้ใช้โดยตรง
  - ซ่อนเมนู "จัดการระบบ" สำหรับผู้ใช้ที่ไม่ใช่ admin/developer
  - แสดงเมนูเฉพาะเมื่อผู้ใช้มีสิทธิ์

### 6. อัปเดต Middleware
- **ไฟล์**: `src/middleware.ts`
- **การเปลี่ยนแปลง**:
  - เพิ่มการตรวจสอบ session token สำหรับหน้า management
  - redirect ไปหน้า login หากไม่มี session

## Role ที่รองรับ

| Role | คำอธิบาย | สิทธิ์การเข้าถึง |
|------|----------|------------------|
| UNAPPROVED | ผู้ใช้ที่ยังไม่ได้รับการอนุมัติ | ไม่สามารถเข้าถึงหน้า management ได้ |
| USER | ผู้ใช้ทั่วไป | ไม่สามารถเข้าถึงหน้า management ได้ |
| ADMIN | ผู้ดูแลระบบ | เข้าถึงได้ทุกหน้า |
| DEVELOPER | นักพัฒนา | เข้าถึงได้ทุกหน้า |

## หน้าเว็บที่ถูกควบคุมสิทธิ์

### หน้าที่ต้องการ ADMIN หรือ DEVELOPER
1. `/management/user` - จัดการผู้ใช้
2. `/management/records` - ข้อมูลทั้งหมด

### หน้าที่ยังคงเข้าถึงได้ทุกคน (ที่มี session)
1. `/management` - ตั้งค่าทั่วไป
2. `/management/my-records` - Med Error ที่ส่งไป
3. `/management/settings/*` - ตั้งค่าผู้ใช้

## การใช้งาน

### สำหรับผู้พัฒนา
```typescript
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, loading, isAdminOrDeveloper } = useAuth();
  
  if (loading) return <div>กำลังโหลด...</div>;
  
  if (!isAdminOrDeveloper) {
    return <AccessDenied />;
  }
  
  return <div>เนื้อหาสำหรับ admin/developer</div>;
}
```

### สำหรับการตรวจสอบสิทธิ์ใน API
```typescript
// ตรวจสอบ role ใน API route
const account = await prisma.account.findUnique({
  where: { id: payload.id },
  select: { role: true },
});

const isAdminOrDeveloper = account.role === "ADMIN" || account.role === "DEVELOPER";
```

## การทดสอบ

1. **ทดสอบด้วย User ธรรมดา**:
   - เข้าสู่ระบบด้วย account ที่มี role = "USER"
   - พยายามเข้าหน้า `/management/user` หรือ `/management/records`
   - ควรเห็นหน้า AccessDenied

2. **ทดสอบด้วย Admin**:
   - เข้าสู่ระบบด้วย account ที่มี role = "ADMIN"
   - เข้าหน้า management ต่างๆ
   - ควรเข้าถึงได้ปกติ

3. **ทดสอบด้วย Developer**:
   - เข้าสู่ระบบด้วย account ที่มี role = "DEVELOPER"
   - เข้าหน้า management ต่างๆ
   - ควรเข้าถึงได้ปกติ

## การบำรุงรักษา

### เพิ่มหน้าใหม่ที่ต้องการควบคุมสิทธิ์
1. Import useAuth hook
2. เพิ่มการตรวจสอบ `isAdminOrDeveloper`
3. แสดง AccessDenied component เมื่อไม่มีสิทธิ์
4. อัปเดต middleware หากจำเป็น

### เปลี่ยนเงื่อนไขการเข้าถึง
แก้ไขใน `src/hooks/use-auth.ts`:
```typescript
const isAdminOrDeveloper = user?.role === 'ADMIN' || user?.role === 'DEVELOPER';
```

## หมายเหตุ

- ระบบใช้ client-side protection เป็นหลัก
- ควรเพิ่ม server-side validation ใน API routes ที่สำคัญ
- การเปลี่ยนแปลง role ต้องทำผ่าน admin interface เท่านั้น 