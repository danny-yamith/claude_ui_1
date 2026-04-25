"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        await fetch("/api/auth/sign-out", { method: "POST" });
      } finally {
        router.push("/");
      }
    }
    logout();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      Logging out...
    </div>
  );
}
