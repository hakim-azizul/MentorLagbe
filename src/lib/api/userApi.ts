import { apiFetch } from "./client";
import type { tUserEdit, tUserRole, tUserPlan } from "@/lib/types/user";

/**
 * প্রোফাইল সার্ভিস — mentor-server-এর
 * `GET /api/profile` ও `PATCH /api/profile` এন্ডপয়েন্ট।
 *
 * দুটোই `apiFetch`-এর মাধ্যমে যায়, তাই Better Auth-এর
 * `Authorization: Bearer <JWT>` হেডার, ৪০১-রিট্রাই ও ApiError
 * হ্যান্ডলিং স্বয়ংক্রিয়ভাবে পাওয়া যায়।
 */

/** ব্যাকএন্ড `toProfileDoc` এর রেসপন্স — এডিটেবল ফিল্ড + ডিসপ্লে কনটেক্সট। */
export type tUserProfile = tUserEdit & {
  _id: string;
  role: tUserRole;
  plan: tUserPlan;
  createdAt: string | null;
};

/**
 * সাইন-ইন করা ইউজারের পূর্ণ প্রোফাইল আনে (নাম, ইমেইল, ইমেজ, ফোন, বায়ো)।
 * সেশন-এ ফোন/বায়ো থাকে না, তাই ফর্ম পপুলেট করতে এই কলটি লাগে।
 * 401 = সেশন শেষ, 404 = ইউজার ডকুমেন্ট নেই — সবই ApiError।
 */
export async function fetchCurrentUserProfile(): Promise<tUserProfile> {
  return apiFetch<tUserProfile>("/api/profile");
}

/**
 * `tUserEdit` ফিল্ডগুলো (name, email, image, phone, bio) PATCH করে
 * আপডেটেড প্রোফাইল ফেরত দেয়। রোল/প্ল্যান বডি‌তে পাঠালেও ব্যাকএন্ড
 * ইগনোর করে (whitelist) — 400 = ভুল ইমেইল/খালি নাম,
 * 409 = ইমেইল অন্য অ্যাকাউন্টে ব্যবহৃত।
 */
export async function updateUserProfile(
  payload: tUserEdit
): Promise<tUserProfile> {
  return apiFetch<tUserProfile>("/api/profile", {
    method: "PATCH",
    body: payload,
  });
}
