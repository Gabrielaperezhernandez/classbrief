import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClassBrief: the news your classes depend on",
  description:
    "For IE students in policy, business and law courses: save the topics your classes cover and follow the latest news on each, in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-slate-600">
            <p>ClassBrief · an independent student project, not an official IE University service</p>
            <Link href="/privacy" className="font-medium text-blue-800 underline">
              Privacy
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
