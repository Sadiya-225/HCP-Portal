import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-navy">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center text-white">
            <Link href="/" aria-label="Hyderabad City Police portal home">
              <Image
                src="/logo.png"
                alt="Hyderabad City Police emblem"
                width={72}
                height={72}
                priority
                className="h-18 w-18"
              />
            </Link>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Hyderabad City Police
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-blue-200">{subtitle}</p>
            ) : null}
          </div>
          <Card>
            <CardContent>{children}</CardContent>
          </Card>
          {footer ? (
            <div className="mt-4 text-center text-sm text-blue-200">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  error,
  id,
  name,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  const inputId = id ?? name;
  const errorId = inputId ? `${inputId}-error` : undefined;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && errorId ? errorId : undefined}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Alert className="border-emerald-600/30 bg-emerald-50 text-emerald-800 [&_[data-slot=alert-description]]:text-emerald-800">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Spinner aria-label="Submitting" />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
