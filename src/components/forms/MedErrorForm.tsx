import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { MedErrorFormSchema, MedErrorFormSchemaType } from "@/lib/zodSchemas";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/use-file-upload";
import { ImageIcon, UploadIcon, XIcon, AlertCircleIcon } from "lucide-react";

type FormValues = MedErrorFormSchemaType;

type Severity = { id: string; code: string; label: string };
type SubErrorType = { id: string; code: string; label: string };
type ErrorType = { id: string; code: string; label: string; subErrorTypes: SubErrorType[] };

export default function MedErrorForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(MedErrorFormSchema),
    defaultValues: {
      eventDate: "",
      description: "",
      severity: "",
      errorType: "",
      subErrorType: "",
      image: undefined,
    },
  });
  const router = useRouter();
  const [severities, setSeverities] = useState<Severity[]>([]);
  const [errorTypes, setErrorTypes] = useState<ErrorType[]>([]);
  const [filteredSubErrorTypes, setFilteredSubErrorTypes] = useState<SubErrorType[]>([]);
  const [userInfo, setUserInfo] = useState<
    | { accountId: string; username: string; name: string; position: string; phone: string; role: string }
    | null
  >(null);
  const [userLoading, setUserLoading] = useState(true);

  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024;
  const maxFiles = 6;
  const [
    { files, isDragging, errors: fileErrors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
    maxSize,
    multiple: true,
    maxFiles,
  });

  useEffect(() => {
    if (files.length > 0) {
      form.setValue(
        "image",
        files.map((f) => (f.file instanceof File ? f.file : undefined)).filter(Boolean)
      );
    } else {
      form.setValue("image", undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  useEffect(() => {
    fetch("/api/severity")
      .then((res) => res.json())
      .then(setSeverities);
    fetch("/api/errorType")
      .then((res) => res.json())
      .then(setErrorTypes);
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        setUserInfo({
          accountId: data.accountId,
          username: data.username,
          name: data.name,
          position: data.position,
          phone: data.phone,
          role: data.role,
        });
        setUserLoading(false);
      })
      .catch(() => setUserLoading(false));
  }, []);

  useEffect(() => {
    const errorTypeId = form.watch("errorType");
    if (!errorTypeId) {
      setFilteredSubErrorTypes([]);
      return;
    }
    const found = errorTypes.find((e) => e.id === errorTypeId);
    setFilteredSubErrorTypes(found ? found.subErrorTypes : []);
  }, [form.watch("errorType"), errorTypes]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (!userInfo || !userInfo.accountId || !userInfo.username) {
        toast.error("ไม่พบข้อมูลผู้รายงาน");
        return;
      }
      if (userInfo.role === "UNAPPROVED") {
        toast.error("บัญชีนี้ยังไม่ได้รับอนุมัติ ไม่สามารถส่งรายงานได้");
        return;
      }
      const formData = new FormData();
      formData.append("eventDate", values.eventDate);
      formData.append("description", values.description);
      formData.append("severity", values.severity);
      formData.append("errorType", values.errorType);
      formData.append("subErrorType", values.subErrorType);
      formData.append("reporterAccountId", userInfo.accountId);
      formData.append("reporterUsername", userInfo.username);
      formData.append("reporterName", userInfo.name || "");
      formData.append("reporterPosition", userInfo.position || "");
      formData.append("reporterPhone", userInfo.phone || "");
      formData.append("reporterOrganizationId", ""); // เพิ่มเติมถ้ามี
      // แนบไฟล์รูปภาพ (รองรับหลายไฟล์)
      if (Array.isArray(values.image)) {
        for (const file of values.image) {
          if (file) formData.append("image", file);
        }
      }
      // ส่งไปยัง API
      const res = await fetch("/api/mederror", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      toast.success("ส่งรายงานสำเร็จ! ขอบคุณที่ส่งรายงาน Med error");
      form.reset();
      if (onSuccess) onSuccess();
      setTimeout(() => {
        router.push("/");
      }, 100);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message || "เกิดข้อผิดพลาด");
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    }
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="eventDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>วัน/เดือน/ปี ที่เกิดเหตุการณ์<FormMessage /></FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รายละเอียดเหตุการณ์<FormMessage /></FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ระดับความรุนแรง<FormMessage /></FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- เลือก --" />
                  </SelectTrigger>
                  <SelectContent>
                    {severities.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="errorType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ประเภทความคลาดเคลื่อน<FormMessage /></FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- เลือก --" />
                  </SelectTrigger>
                  <SelectContent>
                    {errorTypes.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subErrorType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชนิดความคลาดเคลื่อน<FormMessage /></FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- เลือก --" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubErrorTypes.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel>แนบรูปภาพ (อัปโหลดได้สูงสุด {maxFiles} รูป)<FormMessage /></FormLabel>
              <FormControl>
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  data-dragging={isDragging || undefined}
                  data-files={files.length > 0 || undefined}
                  className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
                >
                  <input
                    {...getInputProps()}
                    className="sr-only"
                    aria-label="Upload image file"
                  />
                  {files.length > 0 ? (
                    <div className="flex w-full flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-medium">
                          Uploaded Files ({files.length})
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openFileDialog}
                          disabled={files.length >= maxFiles}
                          type="button"
                        >
                          <UploadIcon className="-ms-0.5 size-3.5 opacity-60" aria-hidden="true" />
                          เพิ่มรูป
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {files.map((file) => (
                          <div
                            key={file.id}
                            className="bg-accent relative aspect-square rounded-md"
                          >
                            <img
                              src={file.preview}
                              alt={file.file.name}
                              className="size-full rounded-[inherit] object-cover"
                            />
                            <Button
                              onClick={() => removeFile(file.id)}
                              size="icon"
                              className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                              aria-label="Remove image"
                              type="button"
                            >
                              <XIcon className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                      <div
                        className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                        aria-hidden="true"
                      >
                        <ImageIcon className="size-4 opacity-60" />
                      </div>
                      <p className="mb-1.5 text-sm font-medium">ลากหรือวางรูปภาพที่นี่</p>
                      <p className="text-muted-foreground text-xs">
                        SVG, PNG, JPG หรือ GIF (สูงสุด {maxSizeMB}MB)
                      </p>
                      <Button variant="outline" className="mt-4" onClick={openFileDialog} type="button">
                        <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
                        เลือกรูปภาพ
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              {(fileErrors.length > 0 || form.formState.errors.image) && (
                <div className="text-destructive flex items-center gap-1 text-xs mt-1" role="alert">
                  <AlertCircleIcon className="size-3 shrink-0" />
                  <span>
                    {fileErrors[0] ||
                      (typeof form.formState.errors.image?.message === "string"
                        ? form.formState.errors.image?.message
                        : "")}
                  </span>
                </div>
              )}
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-2">
          ส่งรายงาน
        </Button>
        <div className="mt-6 p-4 border rounded bg-muted/50 text-sm text-gray-700">
          <div className="mb-1 font-semibold">ข้อมูลผู้รายงาน</div>
          {userLoading ? (
            <div>กำลังโหลดข้อมูลผู้ใช้งาน...</div>
          ) : userInfo ? (
            <>
              <div>ชื่อ-นามสกุล: <span className="font-medium">{userInfo.name || "-"}</span></div>
              <div>ตำแหน่ง: <span className="font-medium">{userInfo.position || "-"}</span></div>
              <div className="mt-2 text-xs text-gray-500">* ระบบจะบันทึกชื่อและตำแหน่งนี้ไว้กับรายงาน</div>
            </>
          ) : (
            <div className="text-red-500">ไม่สามารถโหลดข้อมูลผู้ใช้งาน</div>
          )}
        </div>
      </form>
    </Form>
  );
}
