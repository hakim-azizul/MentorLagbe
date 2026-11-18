"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * GET রিকোয়েস্টের জন্য ছোট helper — loading / error / refetch সব এক জায়গায়।
 * path null দিলে রিকোয়েস্ট যায় না (যেমন সেশন এখনো pending)।
 *
 * NOTE: effect-এর ভেতরে সিঙ্ক setState না ডাকতে প্রথম লোডের ফলাফল
 * প্রমিস কলব্যাকে সেট করা হয় (react-hooks/set-state-in-effect)।
 */
export function useApi<T>(path: string | null): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!path) return;

    const controller = new AbortController();

    apiFetch<T>(path, { signal: controller.signal })
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setData(null);
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [path, reloadKey]);

  const refetch = useCallback(() => {
    if (!path) return;
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }, [path]);

  return { data, loading, error, refetch };
}
