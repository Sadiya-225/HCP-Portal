"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/lib/validation";
import { Field, FormError, SubmitButton } from "@/components/auth-shell";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const linkError = searchParams.get("error");

  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!token || linkError) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-slate-700">
          This password reset link is invalid or has expired. Please request a
          new one.
        </p>
        <Link
          href="/forgot-password"
          className="rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-slate-700">
          Your password has been updated. You can now sign in with your new
          password.
        </p>
        <Link
          href="/login"
          className="rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);
    setFieldErrors({});

    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = resetPasswordSchema.safeParse(data);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        errors[key] ??= issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setPending(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: parsed.data.password,
        token,
      });
      if (error) {
        setFormError(
          "This reset link is invalid or has expired. Please request a new one.",
        );
        return;
      }
      setDone(true);
    } catch {
      setFormError("Connection error. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={fieldErrors.password}
      />
      <Field
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={fieldErrors.confirmPassword}
      />
      <FormError message={formError} />
      <SubmitButton pending={pending}>Update password</SubmitButton>
    </form>
  );
}
