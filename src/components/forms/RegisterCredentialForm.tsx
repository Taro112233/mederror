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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RegisterCredentialSchema, RegisterCredentialSchemaType } from "@/lib/zodSchemas";

export default function RegisterCredentialForm({
  onSubmit,
  onBack,
  submitLabel = "เข้าสู่ระบบ",
}: {
  onSubmit: (username: string, password: string) => void;
  onBack: () => void;
  submitLabel?: string;
}) {
  const form = useForm<RegisterCredentialSchemaType>({
    resolver: zodResolver(RegisterCredentialSchema),
    defaultValues: { username: "", password: "", confirmPassword: "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          onSubmit(values.username, values.password);
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ยืนยันรหัสผ่าน</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            ย้อนกลับ
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  );
}
