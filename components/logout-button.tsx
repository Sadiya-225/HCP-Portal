"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    setError(false);
    try {
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    } catch {
      setError(true);
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        onClick={handleLogout}
        disabled={pending}
        className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
      >
        {pending ? "Signing out…" : "Sign out"}
      </Button>
      {error ? (
        <p className="text-xs text-red-300" role="alert">
          Sign out failed. Please try again.
        </p>
      ) : null}
    </div>
  );
}
