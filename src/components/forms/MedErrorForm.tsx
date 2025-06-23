import { useForm } from "react-hook-form";
import { useState } from "react";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { MedErrorFormSchema, MedErrorFormSchemaType } from "@/lib/zodSchemas";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const severityLevels = [
  { value: "A", label: "A - ไม่มีอันตราย" },
  { value: "B", label: "B - เกือบเกิดอันตราย" },
  { value: "C", label: "C - เกิดอันตรายเล็กน้อย" },
  { value: "D", label: "D - เกิดอันตรายรุนแรง" },
];
const errorTypes = [
  { value: "prescription", label: "การสั่งยา" },
  { value: "dispensing", label: "การจ่ายยา" },
  { value: "administration", label: "การให้ยา" },
];
const subErrorTypes = [
  { value: "dose", label: "ขนาดยา" },
  { value: "drug", label: "ชื่อยา" },
  { value: "route", label: "วิธีให้ยา" },
];

type FormValues = MedErrorFormSchemaType;

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
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const onSubmit = (data: FormValues) => {
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
                    {severityLevels.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
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
                      <SelectItem key={e.value} value={e.value}>
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
                    {subErrorTypes.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
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
            const { value, onChange, ref, name, ...rest } = field;
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
      </form>
    </Form>
  );
}
