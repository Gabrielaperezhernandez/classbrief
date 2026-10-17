// Top bar shown on every page. Logged-in users always see "Log out" (grading contract).
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import Logo from "./Logo";

const navLink =
  "rounded-md px-2 py-1.5 text-sm font-medium text-muted hover:bg-brand-soft hover:text-brand";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-card/95 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link href={user ? "/news" : "/"} aria-label="ClassBrief home">
          {/* On small phones, logged-in users see only the logo mark so the menu fits. */}
          <Logo compact={Boolean(user)} />
        </Link>
        {user ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/news" className={navLink}>
              My news
            </Link>
            <Link href="/app" className={navLink}>
              My topics
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className={navLink}>
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-brand px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
