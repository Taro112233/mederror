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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          if (disabled) return;
          onSelect(values.organization);
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>เลือกองค์กร</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value} required disabled={loading || orgs.length === 0 || disabled}>
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "กำลังโหลด..." : "--เลือก--"} />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs.map((org) => (
                      <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row justify-between items-center">
          <div className="w-30" />
          <div className="flex-1" />
          <Button type="submit" disabled={loading || orgs.length === 0 || disabled} className="w-30">
            {disabled ? "กำลังประมวลผล..." : "ถัดไป"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
