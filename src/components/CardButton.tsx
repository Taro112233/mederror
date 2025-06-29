"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

interface CardButtonProps extends React.ComponentProps<typeof Card> {
  href: string;
  children: React.ReactNode;
}

export default function CardButton({ href, children, className, ...props }: CardButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!loading) {
      setLoading(true);
      router.push(href);
    }
  };

  return (
    <Card
      className={"relative cursor-pointer transition-shadow hover:shadow-md " + (className || "")}
      tabIndex={0}
      role="button"
      onClick={handleClick}
      {...props}
    >
      {children}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-xl">
          <svg className="animate-spin h-8 w-8 text-gray-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      )}
    </Card>
  );
} 