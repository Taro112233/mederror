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
import { OrganizationSelectSchema, OrganizationSelectSchemaType } from "@/lib/zodSchemas";
import { useEffect, useState } from "react";

export default function OrganizationSelectForm({ onSelect }: { onSelect: (s: string) => void }) {
  const form = useForm<OrganizationSelectSchemaType>({
    resolver: zodResolver(OrganizationSelectSchema),
    defaultValues: { organization: "" },
  });

  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/organizations")
      .then((res) => res.json())
      .then((data) => setOrgs(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
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
                <Select onValueChange={field.onChange} value={field.value} required disabled={loading || orgs.length === 0}>
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
        <Button type="submit" disabled={loading || orgs.length === 0}>ถัดไป</Button>
      </form>
    </Form>
  );
}
