// Top bar shown on every page. Logged-in users always see "Log out" (grading contract).
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href={user ? "/app" : "/"} className="text-lg font-bold text-slate-900">
          ClassBrief
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/news" className="text-sm font-medium text-slate-700 hover:underline">
              My news
            </Link>
            <Link href="/app" className="text-sm font-medium text-slate-700 hover:underline">
              My topics
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:underline">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
