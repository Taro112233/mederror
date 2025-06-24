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
  username: z.string().min(1, { message: "" }),
  password: z.string().min(1, { message: "" }),
  confirmPassword: z.string().min(1, { message: "" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

export type LoginCredentialSchemaType = z.infer<typeof LoginCredentialSchema>;

export const OrganizationSelectSchema = z.object({
  organization: z.string().min(1, { message: "" }),
});

export type OrganizationSelectSchemaType = z.infer<typeof OrganizationSelectSchema>;

export const OnboardingFormSchema = z.object({
  name: z.string().min(1, { message: "" }),
  phone: z.string().min(1, { message: "" }),
  position: z.string().min(1, { message: "" }),
});

export type OnboardingFormSchemaType = z.infer<typeof OnboardingFormSchema>; 