import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <Skeleton className="h-10 w-1/2 mb-4 mx-auto" />
        <Skeleton className="h-32 w-full mb-4" />
      </div>
    </div>
  );
} 