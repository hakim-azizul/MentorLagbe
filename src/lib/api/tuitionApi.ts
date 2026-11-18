import { apiFetch } from "./client";
import type { tTuitionDetails, tTuitionView } from "@/lib/types/tuition";

/**
 * পাবলিক টিউশন সার্ভিস — mentor-server-এর
 * `GET /api/tuitions` ও `GET /api/tuitions/:id` এন্ডপয়েন্ট।
 */

/**
 * অনুমোদিত (approved) ও সক্রিয় (isActive) সব টিউশন আনে।
 * `queryString` উদাহরণ: `search=phys&subject=Physics&mode=Online`
 */
export async function fetchApprovedTuitions(
  queryString?: string
): Promise<tTuitionView[]> {
  const query = queryString ? `?${queryString}` : "";
  return apiFetch<tTuitionView[]>(`/api/tuitions${query}`);
}

/** একটি টিউশনের বিস্তারিত তথ্য + টিউশনার প্রোফাইল সামারি। 404 হলে ApiError ফেলে। */
export async function fetchTuitionById(id: string): Promise<tTuitionDetails> {
  return apiFetch<tTuitionDetails>(`/api/tuitions/${id}`);
}
