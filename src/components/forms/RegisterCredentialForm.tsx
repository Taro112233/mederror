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
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, User, Lock, Shield } from "lucide-react";

export default function RegisterCredentialForm({
  onSubmit,
  onBack,
  submitLabel = "สมัครสมาชิก",
  disabled = false,
}: {
  onSubmit: (username: string, password: string) => void;
  onBack: () => void;
  submitLabel?: string;
  disabled?: boolean;
}) {
  const form = useForm<RegisterCredentialSchemaType>({
    resolver: zodResolver(RegisterCredentialSchema),
    defaultValues: { username: "", password: "", confirmPassword: "" },
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            if (disabled) return;
            onSubmit(values.username, values.password);
          })}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Username</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={disabled}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      placeholder="กรอก Username"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>รหัสผ่าน</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      {...field} 
                      disabled={disabled}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      placeholder="กรอกรหัสผ่าน"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>ยืนยันรหัสผ่าน</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      {...field} 
                      disabled={disabled}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 pt-4"
          >
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack} 
              className="flex-1 h-10" 
              disabled={disabled}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              ย้อนกลับ
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-10" 
              disabled={disabled}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {disabled ? "กำลังสมัครสมาชิก..." : submitLabel}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
