"use client";

// Logs the user out of Supabase, then goes back to the landing page.
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await createClient().auth.signOut();
    // Back to the landing page, re-rendering the header without the session.
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      data-testid="logout"
      onClick={handleLogout}
      className="rounded-md border border-line bg-card px-3 py-1.5 text-sm font-medium text-ink hover:bg-paper"
    >
      Log out
    </button>
  );
}
