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
import { OnboardingFormSchema, OnboardingFormSchemaType } from "@/lib/zodSchemas";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface OnboardingFormProps {
  onSubmit: (data: { name: string; phone: string; position: string }) => void;
}

export default function OnboardingForm({ onSubmit }: OnboardingFormProps) {
  const form = useForm<OnboardingFormSchemaType>({
    resolver: zodResolver(OnboardingFormSchema),
    defaultValues: { name: "", phone: "", position: "" },
  });

  return (
    <Card className="flex justify-center max-w-xs mx-auto mt-10">
      <CardHeader>
        <CardTitle>ลงทะเบียนข้อมูลผู้ใช้</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อ-นามสกุล</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เบอร์โทร</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ตำแหน่ง</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              บันทึกข้อมูล
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
