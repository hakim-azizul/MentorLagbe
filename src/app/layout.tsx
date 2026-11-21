import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { SavedTuitionsProvider } from "@/components/shared/SavedTuitionsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MentorLagbe — Tuition & Mentorship Platform",
    template: "%s | MentorLagbe",
  },
  description:
    "Find verified tutors and structured mentorship batches, or share your expertise as a tutor on MentorLagbe.",
  openGraph: {
    type: "website",
    siteName: "MentorLagbe",
    title: "MentorLagbe — Tuition & Mentorship Platform",
    description: "Learn from verified tutors or teach students on MentorLagbe.",
  },
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
        <SavedTuitionsProvider>
          <main>{children}</main>
          <Toaster />
        </SavedTuitionsProvider>
      </body>
    </html>
  );
}
