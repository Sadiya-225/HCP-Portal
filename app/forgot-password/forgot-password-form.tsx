"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema } from "@/lib/validation";
import { Field, FormError, FormSuccess, SubmitButton } from "@/components/auth-shell";

const GENERIC_SUCCESS =
  "If an account exists for that email address, we have sent password reset instructions.";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);
    setSuccess(undefined);
    setFieldErrors({});

    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = forgotPasswordSchema.safeParse(data);
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
      await authClient.requestPasswordReset({
        email: parsed.data.email,
        redirectTo: "/reset-password",
      });
      setSuccess(GENERIC_SUCCESS);
    } catch {
      setFormError("Connection error. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={fieldErrors.email}
      />
      <FormError message={formError} />
      <FormSuccess message={success} />
      <SubmitButton pending={pending}>Send reset instructions</SubmitButton>
    </form>
  );
}
