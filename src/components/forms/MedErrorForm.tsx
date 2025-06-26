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
  const [userInfo, setUserInfo] = useState<{ name: string; position: string } | null>(null);
  const [userLoading, setUserLoading] = useState(true);

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
        setUserInfo({ name: data.name, position: data.position });
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

  const onSubmit = () => {
    form.reset();
    toast.success("ส่งรายงานสำเร็จ! ขอบคุณที่ส่งรายงาน Med error");
    if (onSuccess) onSuccess();
    setTimeout(() => {
      router.push("/");
    }, 100);
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
          render={({ field }) => {
            const { onChange, ref, name, ...rest } = field;
            return (
              <FormItem>
                <FormLabel>แนบรูปภาพ</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onChange(e.target.files)}
                    name={name}
                    ref={ref}
                    {...rest}
                  />
                </FormControl>
              </FormItem>
            );
          }}
        />
        <Button type="submit" className="w-full mt-2">
          ส่งรายงาน
        </Button>
        {/* User info section */}
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
