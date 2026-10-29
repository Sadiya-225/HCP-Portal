import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      footer={
        <Link href="/login" className="font-semibold text-white underline">
          Back to sign in
        </Link>
      }
    >
      <Suspense
        fallback={
          <p className="text-center text-sm text-slate-600">Loading…</p>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
