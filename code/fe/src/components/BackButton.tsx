"use client";
import React from "react";
import { useRouter } from "next/navigation";

type Props = {
  fallback?: string;
  className?: string;
};

export default function BackButton({ fallback = "/student/find-tutor", className = "text-sm font-semibold text-light-heavy-blue hover:underline inline-flex items-center gap-1" }: Props) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <a href="#" onClick={handleClick} className={className}>
      ← Back
    </a>
  );
}
