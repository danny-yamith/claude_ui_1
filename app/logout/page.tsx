"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    signOut().finally(() => router.push("/"));
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      Logging out...
    </div>
  );
}
