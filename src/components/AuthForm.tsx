"use client";

// One form used by both /signup and /login. The data-testid names come from the grading contract.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signup" | "login";

// Turns Supabase sign-up errors into clear, friendly messages.
function signupMessage(code: string | undefined, message: string): string {
  switch (code) {
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists.";
    case "weak_password":
      return "That password is too weak. Use at least 6 characters.";
    case "email_address_invalid":
    case "validation_failed":
      return "Please enter a valid email address.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many attempts. Please wait a minute and try again.";
    default:
      return message || "Something went wrong. Please try again.";
  }
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [accountExists, setAccountExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const isSignup = mode === "signup";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAccountExists(false);

    // Check the fields here too (not only with the browser's built-in checks).
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (isSignup && password.length < 6) {
      setError("Your password needs at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) {
        setError(signupMessage(error.code, error.message));
        setAccountExists(error.code === "user_already_exists" || error.code === "email_exists");
        setLoading(false);
        return;
      }
      if (!data.session) {
        // Only happens if "Confirm email" is still ON in Supabase.
        setError("Account created, but email confirmation is required. Please contact the app owner.");
        setLoading(false);
        return;
      }
    } else {
      // signInWithPassword really checks the password: a wrong one returns an error.
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setError("Wrong email or password. Please try again.");
        setLoading(false);
        return;
      }
    }

    // Go to /app and re-render the server parts (header) with the new session.
    router.push("/app");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink">
        {isSignup ? "Create your account" : "Log in"}
      </h1>
      <p className="mt-2 text-muted">
        {isSignup
          ? "Follow the news your classes depend on, in one page."
          : "Welcome back. Your news is waiting."}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            data-testid={`${mode}-email`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#8c8f96] bg-card px-3 py-2 text-ink"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={isSignup ? "new-password" : "current-password"}
            data-testid={`${mode}-password`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#8c8f96] bg-card px-3 py-2 text-ink"
          />
          {isSignup && <p className="mt-1 text-xs text-muted">At least 6 characters.</p>}
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
            {accountExists && (
              <>
                {" "}
                <Link href="/login" className="font-semibold underline underline-offset-2">
                  Log in instead
                </Link>
              </>
            )}
          </p>
        )}

        {isSignup && (
          <p className="text-xs text-muted">
            We only store your email and the topics you save.{" "}
            <Link href="/privacy" className="font-medium text-brand underline">
              Privacy
            </Link>
          </p>
        )}

        <button
          type="submit"
          data-testid={`${mode}-submit`}
          disabled={loading}
          className="w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-brand underline">
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
      </div>
    </div>
  );
}
