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