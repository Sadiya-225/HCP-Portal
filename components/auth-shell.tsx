import Image from "next/image";
import Link from "next/link";

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
            <h1 className="mt-2 text-2xl font-bold">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-blue-200">{subtitle}</p>
            ) : null}
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg sm:p-8">
            {children}
          </div>
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

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20 disabled:bg-slate-100";

export function Field({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input className={inputClass} {...props} />
      {error ? (
        <span className="mt-1 block text-xs text-red-600" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      role="alert"
    >
      {message}
    </p>
  );
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
      {message}
    </p>
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
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}
