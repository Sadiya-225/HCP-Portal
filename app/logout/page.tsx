"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AuthShell } from "@/components/auth-shell";

export default function LogoutPage() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void authClient
      .signOut()
      .catch(() => undefined)
      .finally(() => {
        router.replace("/login");
        router.refresh();
      });
  }, [router]);

  return (
    <AuthShell title="Signing out" subtitle="Please wait…">
      <p className="text-center text-sm text-slate-600">
        You are being signed out of your account.
      </p>
    </AuthShell>
  );
}
