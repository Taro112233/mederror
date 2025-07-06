import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrganizationSelectSchema, OrganizationSelectSchemaType } from "@/lib/zodSchemas";
import { motion } from "framer-motion";
import { Building2, ArrowRight, Loader2 } from "lucide-react";

export default function OrganizationSelectForm({ 
  onSelect,
  disabled = false
}: { 
  onSelect: (s: string) => void;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const form = useForm<OrganizationSelectSchemaType>({
    resolver: zodResolver(OrganizationSelectSchema),
    defaultValues: { organization: "" },
  });

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await fetch("/api/organizations");
        if (res.ok) {
          const data = await res.json();
          setOrgs(data);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            if (disabled) return;
            onSelect(values.organization);
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
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>เลือกหน่วยงาน หรือ องค์กร</span>
                  </FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      required 
                      disabled={loading || orgs.length === 0 || disabled}
                    >
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                        <SelectValue 
                          placeholder={
                            loading ? (
                              <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>กำลังโหลด...</span>
                              </div>
                            ) : "--เลือกหน่วยงาน หรือ องค์กร--"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {orgs.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            className="flex justify-end pt-4"
          >
            <Button 
              type="submit" 
              disabled={loading || orgs.length === 0 || disabled} 
              className="w-full sm:w-auto"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {disabled ? "กำลังประมวลผล..." : "ถัดไป"}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
