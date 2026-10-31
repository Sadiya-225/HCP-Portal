import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { getCurrentUser } from "@/lib/dal";
import { LogoutButton } from "@/components/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

async function AccountSummary() {
  const user = await getCurrentUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg text-navy">
          Your account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:gap-2">
            <dt className="w-32 font-medium text-muted-foreground">Name</dt>
            <dd>{user.name}</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-2">
            <dt className="w-32 font-medium text-muted-foreground">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-2">
            <dt className="w-32 font-medium text-muted-foreground">Email verified</dt>
            <dd>{user.emailVerified ? "Yes" : "No"}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
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
        <h1 className="font-display text-2xl font-bold text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to your citizen services account.
        </p>
        <div className="mt-6">
          <Suspense
            fallback={
              <Card>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Loading your account…
                  </p>
                </CardContent>
              </Card>
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
