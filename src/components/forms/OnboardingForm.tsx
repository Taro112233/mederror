'use client';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { OnboardingFormSchema, OnboardingFormSchemaType } from "@/lib/zodSchemas";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/button/LogoutButton";
import { motion } from "framer-motion";
import { User, Phone, Briefcase, Save, LogOut } from "lucide-react";

export default function OnboardingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<OnboardingFormSchemaType>({
    resolver: zodResolver(OnboardingFormSchema),
    defaultValues: { name: "", phone: "", position: "" },
  });
  const router = useRouter();

  const handleSubmit = async (data: { name: string; phone: string; position: string }) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      router.push("/");
    } catch (error) {
      console.error("Error during onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    {
      name: "name" as const,
      label: "ชื่อ-นามสกุล",
      icon: User,
      placeholder: "กรอกชื่อ-นามสกุล"
    },
    {
      name: "phone" as const,
      label: "เบอร์โทร",
      icon: Phone,
      placeholder: "กรอกเบอร์โทรศัพท์"
    },
    {
      name: "position" as const,
      label: "ตำแหน่ง",
      icon: Briefcase,
      placeholder: "กรอกตำแหน่งงาน"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          {formFields.map((field, index) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <FormField
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <field.icon className="h-4 w-4" />
                      <span>{field.label}</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...formField} 
                        disabled={isLoading}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        placeholder={field.placeholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 pt-4"
          >
            <LogoutButton 
              className="flex-1" 
              variant="secondary" 
              disabled={isLoading} 
            />
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
