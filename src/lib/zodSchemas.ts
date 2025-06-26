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
      (files) => {
        if (!files || (Array.isArray(files) && files.length === 0) || (files instanceof FileList && files.length === 0)) return true;
        const arr = files instanceof FileList ? Array.from(files) : Array.isArray(files) ? files : [files];
        return arr.every((f) => f && typeof f.type === "string" && f.type.startsWith("image/"));
      },
      {
        message: "ไฟล์ต้องเป็นรูปภาพเท่านั้น",
      }
    ),
});

export type MedErrorFormSchemaType = z.infer<typeof MedErrorFormSchema>;

// Login: แค่ username, password
export const LoginCredentialSchema = z.object({
  username: z.string().min(1, { message: "" }),
  password: z.string().min(1, { message: "" }),
});
export type LoginCredentialSchemaType = z.infer<typeof LoginCredentialSchema>;

// Register: username, password, confirmPassword
export const RegisterCredentialSchema = z.object({
  username: z.string().min(1, { message: "" }),
  password: z.string().min(1, { message: "" }),
  confirmPassword: z.string().min(1, { message: "" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});
export type RegisterCredentialSchemaType = z.infer<typeof RegisterCredentialSchema>;

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