import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { getCurrentUser } from "@/lib/dal";
import { LogoutButton } from "@/components/logout-button";

export const metadata: Metadata = { title: "Dashboard" };

async function AccountSummary() {
  const user = await getCurrentUser();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-navy">Your account</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        <div className="flex flex-col sm:flex-row sm:gap-2">
          <dt className="w-32 font-medium text-muted">Name</dt>
          <dd>{user.name}</dd>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-2">
          <dt className="w-32 font-medium text-muted">Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-2">
          <dt className="w-32 font-medium text-muted">Email verified</dt>
          <dd>{user.emailVerified ? "Yes" : "No"}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-navy text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-4">
          <Image
            src="/logo.png"
            alt="Hyderabad City Police emblem"
            width={48}
            height={48}
            className="h-12 w-12"
          />
          <div>
            <p className="text-base font-semibold tracking-wide">
              Hyderabad City Police
            </p>
            <p className="text-xs text-blue-200">Citizen Services Portal</p>
          </div>
          <div className="ml-auto">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Welcome to your citizen services account.
        </p>
        <div className="mt-6">
          <Suspense
            fallback={
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-muted shadow-sm">
                Loading your account…
              </div>
            }
          >
            <AccountSummary />
          </Suspense>
        </div>
      </main>

      <footer className="bg-navy px-6 py-6 text-center text-xs text-blue-200">
        Hyderabad City Police — Citizen Services Portal
      </footer>
    </div>
  );
}
