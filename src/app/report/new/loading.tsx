import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-1/3 mb-4" />
      <Skeleton className="h-24 w-full mb-4" />
      <Skeleton className="h-96 w-full mb-4" />
    </div>
  );
} 