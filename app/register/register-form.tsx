"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/validation";
import { Field, FormError, SubmitButton } from "@/components/auth-shell";

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);
    setFieldErrors({});

    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = registerSchema.safeParse(data);
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
      const { error } = await authClient.signUp.email({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL: "/dashboard",
      });
      if (error) {
        setFormError(
          "We could not create your account. Please check your details and try again.",
        );
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("Connection error. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <Field
        label="Full name"
        name="name"
        type="text"
        autoComplete="name"
        required
        error={fieldErrors.name}
      />
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={fieldErrors.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={fieldErrors.password}
      />
      <Field
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={fieldErrors.confirmPassword}
      />
      <FormError message={formError} />
      <SubmitButton pending={pending}>Create account</SubmitButton>
    </form>
  );
}
