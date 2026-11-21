"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "mentorlagbe-theme";
const THEME_EVENT = "mentorlagbe-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

/** DOM-এর `.dark` ক্লাসই থিমের একমাত্র সত্য-উৎস */
function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

/**
 * লাইট/ডার্ক টগল — স্টেট useSyncExternalStore থেকে আসে,
 * ফলে effect-এ setState নেই, hydration mismatch-ও নেই। আইকনগুলো CSS
 * `dark:` ভ্যারিয়েন্টে বদলায় (inline script রিফ্রেশে আগেই ক্লাস বসায়)।
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const nextIsDark = !getSnapshot();
    document.documentElement.classList.toggle("dark", nextIsDark);

    try {
      localStorage.setItem(STORAGE_KEY, nextIsDark ? "dark" : "light");
    } catch {
      // সংরক্ষণ ব্লক হলেও বর্তমান সেশনে থিম প্রয়োগ থাকবে
    }

    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl border border-border-subtle bg-surface text-heading transition-colors hover:border-brand/40 hover:bg-brand-tint focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40 cursor-pointer",
        className
      )}
    >
      <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
    </button>
  );
}
