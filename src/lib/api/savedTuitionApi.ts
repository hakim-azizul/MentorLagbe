import { apiFetch } from "./client";
import type { tTuitionView } from "@/lib/types/tuition";

/**
 * বুকমার্ক সার্ভিস — mentor-server-এর `/api/saved-tuitions` এন্ডপয়েন্টগুলো।
 * সব কল `apiFetch` দিয়ে যায় (Bearer JWT, 401-রিট্রাই, ApiError সহ)।
 */

export type tSavedIdsResult = {
  savedIds: string[];
};

export type tSavedToggleResult = {
  saved: boolean;
  _id?: string;
};

/** বর্তমান শিক্ষার্থীর বুকমার্ক করা টিউশন আইডিগুলো (প্রথম লোডে স্টেট সেট করতে)। */
export async function fetchSavedTuitionIds(
  signal?: AbortSignal,
): Promise<tSavedIdsResult> {
  return apiFetch<tSavedIdsResult>("/api/saved-tuitions/ids", { signal });
}

/** নতুন করে সেভ করা টিউশনগুলো — নতুন থেকে পুরনো ক্রমে, টিউটর সামারি সহ। */
export async function fetchSavedTuitions(
  signal?: AbortSignal,
): Promise<(tTuitionView & { savedAt?: string | null })[]> {
  return apiFetch<(tTuitionView & { savedAt?: string | null })[]>(
    "/api/saved-tuitions",
    { signal },
  );
}

/** একই টিউশন বুকমার্ক/আনবুকমার্ক টগল করে নতুন অবস্থা ফেরত দেয়। */
export async function toggleSavedTuition(
  tuitionId: string,
): Promise<tSavedToggleResult> {
  return apiFetch<tSavedToggleResult>("/api/saved-tuitions/toggle", {
    method: "POST",
    body: { tuitionId },
  });
}
