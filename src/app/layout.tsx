import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import Link from "next/link";
import Header from "@/components/Header";
import Logo from "@/components/Logo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Serif font for headlines (editorial newspaper style).
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClassBrief: the news your classes depend on",
  description:
    "For IE students in policy, business and law courses: pick your class topics and get one news page that shows each story across the FT, The Economist, the BBC, Le Monde and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-line bg-card">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <Logo />
            <p className="text-xs">
              An independent student project, not an official IE University service.
            </p>
            <Link href="/privacy" className="text-xs font-medium text-brand underline underline-offset-2">
              Privacy
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
