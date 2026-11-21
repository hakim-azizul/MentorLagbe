import { apiFetch } from "./client";
import type {
  tTuitionDetails,
  tTuitionPage,
  tTuitionQuery,
  tTuitionView,
} from "@/lib/types/tuition";

/**
 * পাবলিক টিউশন সার্ভিস — mentor-server-এর
 * `GET /api/tuitions` ও `GET /api/tuitions/:id` এন্ডপয়েন্ট।
 */

/**
 * অনুমোদিত (approved) ও সক্রিয় (isActive) সব টিউশন আনে।
 * `queryString` উদাহরণ: `search=phys&subject=Physics&mode=Online&sort=fee_asc`
 * — সার্চ/ফিল্টার/সর্ট URL প্যারামিটার থেকেই এসেছে (`/tuitions` পেজ)।
 * `signal` দিলে আগের রিকোয়েস্টটি abort করা যায় (ফিল্টার দ্রুত বদলানোর সময়)।
 * প্রতিটি আইটেমে `tutor` প্রোফাইল সামারি (image সহ) থাকে।
 */
export async function fetchApprovedTuitions(
  queryString?: string,
  signal?: AbortSignal
): Promise<tTuitionView[]> {
  const query = queryString ? `?${queryString}` : "";
  return apiFetch<tTuitionView[]>(`/api/tuitions${query}`, { signal });
}

/**
 * পেজ-ভিত্তিক ব্রাউজ — `?meta=1` দিয়ে আইটেম + pagination মেটাডেটা ফেরত দেয়।
 * ডিফল্ট `page=1`, `limit=12` (সার্ভার maximum 50)।
 */
export async function fetchTuitions({
  page = 1,
  limit = 12,
  signal,
  ...filters
}: tTuitionQuery & { signal?: AbortSignal } = {}): Promise<tTuitionPage> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.subject) params.set("subject", filters.subject);
  if (filters.classLevel) params.set("classLevel", filters.classLevel);
  if (filters.mode) params.set("mode", filters.mode);
  if (filters.sort) params.set("sort", filters.sort);
  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("meta", "1");

  return apiFetch<tTuitionPage>(`/api/tuitions?${params.toString()}`, {
    signal,
  });
}

/** একটি টিউশনের বিস্তারিত তথ্য + টিউশনার প্রোফাইল সামারি। 404 হলে ApiError ফেলে। */
export async function fetchTuitionById(id: string): Promise<tTuitionDetails> {
  return apiFetch<tTuitionDetails>(`/api/tuitions/${id}`);
}
