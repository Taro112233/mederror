import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SangkadSelectSchema, SangkadSelectSchemaType } from "@/lib/zodSchemas";

export default function SangkadSelectForm({ onSelect }: { onSelect: (s: string) => void }) {
  const form = useForm<SangkadSelectSchemaType>({
    resolver: zodResolver(SangkadSelectSchema),
    defaultValues: { sangkad: "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          onSelect(values.sangkad);
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="sangkad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>เลือกสังกัด</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value} required>
                  <SelectTrigger>
                    <SelectValue placeholder="--เลือก--" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    {/* เพิ่ม option ตามต้องการ */}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">ถัดไป</Button>
      </form>
    </Form>
  );
}
