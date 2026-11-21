import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MentorLagbe",
  description: "Smart Tuition & Mentorship Platform",
};

/**
 * হাইড্রেশনের আগেই localStorage থেকে থিম চাপুন — ফলে রিফ্রেশে সাদা
 * ফ্ল্যাশ বা hydration mismatch হয় না (থিম ক্লাস সার্ভার HTML-এ থাকে না)।
 */
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('mentorlagbe-theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
