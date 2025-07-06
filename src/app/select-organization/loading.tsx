import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-8">
        <Skeleton className="h-10 w-1/2 mb-4 mx-auto" />
        <Skeleton className="h-24 w-full mb-4" />
      </div>
    </div>
  );
} 