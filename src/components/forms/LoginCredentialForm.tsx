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
import { LoginCredentialSchema, LoginCredentialSchemaType } from "@/lib/zodSchemas";

export default function LoginCredentialForm({
  onSubmit,
  onBack,
  disabled = false,
}: {
  onSubmit: (username: string, password: string) => void;
  onBack: () => void;
  disabled?: boolean;
}) {
  const form = useForm<LoginCredentialSchemaType>({
    resolver: zodResolver(LoginCredentialSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          if (disabled) return;
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
                <Input {...field} disabled={disabled} />
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
                <Input type="password" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row justify-between items-center">
          <Button type="button" variant="outline" onClick={onBack} className="w-30" disabled={disabled}>
            ย้อนกลับ
          </Button>
          <div className="flex-1" />
          <Button type="submit" className="w-30" disabled={disabled}>
            {disabled ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
