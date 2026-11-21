"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "@/lib/auth-client";
import {
  fetchSavedTuitionIds,
  toggleSavedTuition,
} from "@/lib/api/savedTuitionApi";
import type { tUserRole } from "@/lib/types/user";

type SavedTuitionsContextValue = {
  /** সেভ করা টিউশনের আইডি — কার্ড/ডিটেইলে সক্রিয় অবস্থা দেখাতে। */
  savedIds: Set<string>;
  /** সেশন বা আইডি লোড চলছে কিনা (বাটন ডিজেবল করতে)। */
  loading: boolean;
  /** শিক্ষার্থী কিনা — বুকমার্ক অ্যাকশন শুধু তাদেরই অনুমোদিত। */
  canSave: boolean;
  role: tUserRole | null;
  sessionPending: boolean;
  /** অপটিমিস্টিক আপডেট + সার্ভার কনফার্মেশন; এরর থ্রো করে (টোস্ট কম্পোনেন্ট ধরে)। */
  toggle: (tuitionId: string) => Promise<boolean>;
};

const EMPTY_IDS: Set<string> = new Set();

const SavedTuitionsContext =
  createContext<SavedTuitionsContextValue | null>(null);

/**
 * একবারই লগ-ইন করা শিক্ষার্থীর বুকমার্ক আইডিগুলো লোড করে সব কার্ড ও
 * ডিটেইলস পেজে শেয়ার করে — প্রতিটি কার্ড থেকে আলাদা রিকোয়েস্ট যায় না।
 */
export function SavedTuitionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const role = (session?.user?.role ?? null) as tUserRole | null;
  const canSave = role === "student";

  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [idsLoaded, setIdsLoaded] = useState(false);

  useEffect(() => {
    if (!canSave) return;

    let cancelled = false;
    const controller = new AbortController();

    fetchSavedTuitionIds(controller.signal)
      .then((result) => {
        if (cancelled) return;
        setSavedIds(new Set(result.savedIds ?? []));
        setIdsLoaded(true);
      })
      .catch(() => {
        // 401/403 বা নেটওয়ার্ক এররে পাবলিক ব্রাউজিং ভাঙা যাবে না
        if (!cancelled) setIdsLoaded(true);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [canSave]);

  const toggle = useCallback(
    async (tuitionId: string): Promise<boolean> => {
      const wasSaved = savedIds.has(tuitionId);

      // অপটিমিস্টিক আপডেট — ক্লিকের সাথে সাথেই UI বদলে যায়
      setSavedIds((previous) => {
        const next = new Set(previous);
        if (wasSaved) next.delete(tuitionId);
        else next.add(tuitionId);
        return next;
      });

      try {
        const result = await toggleSavedTuition(tuitionId);
        setSavedIds((previous) => {
          const next = new Set(previous);
          if (result.saved) next.add(tuitionId);
          else next.delete(tuitionId);
          return next;
        });
        return result.saved;
      } catch (error) {
        // ব্যর্থ হলে পুরনো অবস্থা ফেরত আনুন
        setSavedIds((previous) => {
          const next = new Set(previous);
          if (wasSaved) next.add(tuitionId);
          else next.delete(tuitionId);
          return next;
        });
        throw error;
      }
    },
    [savedIds],
  );

  const value = useMemo<SavedTuitionsContextValue>(
    () => ({
      savedIds: canSave ? savedIds : EMPTY_IDS,
      loading: canSave && (!idsLoaded || isPending),
      canSave,
      role,
      sessionPending: isPending,
      toggle,
    }),
    [canSave, savedIds, idsLoaded, isPending, role, toggle],
  );

  return (
    <SavedTuitionsContext.Provider value={value}>
      {children}
    </SavedTuitionsContext.Provider>
  );
}

export function useSavedTuitions(): SavedTuitionsContextValue {
  const context = useContext(SavedTuitionsContext);
  if (!context) {
    throw new Error(
      "useSavedTuitions must be used inside <SavedTuitionsProvider>.",
    );
  }
  return context;
}
