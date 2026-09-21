"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/storage";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getCurrentUser()) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}
