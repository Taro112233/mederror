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
  submitLabel = "สมัครสมาชิก",
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
        <div className="flex flex-row justify-between items-center">
          <Button type="button" variant="outline" onClick={onBack} className="w-30">
            ย้อนกลับ
          </Button>
          <div className="flex-1" />
          <Button type="submit" className="w-30">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  );
}
