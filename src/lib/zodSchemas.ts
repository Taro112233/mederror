import { z } from "zod";

export const MedErrorFormSchema = z.object({
  eventDate: z.string().min(1, { message: "" }),
  description: z.string().min(1, { message: "" }),
  severity: z.string().min(1, { message: "" }),
  errorType: z.string().min(1, { message: "" }),
  subErrorType: z.string().min(1, { message: "" }),
  image: z
    .any()
    .optional()
    .refine(
      (files) =>
        !files ||
        (files instanceof FileList && files.length === 0) ||
        (files instanceof FileList && files[0].type.startsWith("image/")),
      {
        message: "ไฟล์ต้องเป็นรูปภาพเท่านั้น",
      }
    ),
});

export type MedErrorFormSchemaType = z.infer<typeof MedErrorFormSchema>;

export const LoginCredentialSchema = z.object({
  username: z.string().min(1, { message: "กรุณากรอกชื่อผู้ใช้" }),
  password: z.string().min(1, { message: "กรุณากรอกรหัสผ่าน" }),
});

export type LoginCredentialSchemaType = z.infer<typeof LoginCredentialSchema>;

export const SangkadSelectSchema = z.object({
  sangkad: z.string().min(1, { message: "กรุณาเลือกสังกัด" }),
});

export type SangkadSelectSchemaType = z.infer<typeof SangkadSelectSchema>;

export const OnboardingFormSchema = z.object({
  name: z.string().min(1, { message: "กรุณากรอกชื่อ-นามสกุล" }),
  phone: z.string().min(1, { message: "กรุณากรอกเบอร์โทร" }),
  position: z.string().min(1, { message: "กรุณากรอกตำแหน่ง" }),
});

export type OnboardingFormSchemaType = z.infer<typeof OnboardingFormSchema>; 