/**
 * ফ্রন্টএন্ড API সার্ভিস লেয়াং।
 *
 * UI কম্পোনেন্টে সরাসরি `fetch` না করে এই ফাংশনগুলো ইমপোর্ট করে ব্যবহার করুন:
 *   import { fetchApprovedTuitions } from "@/lib/api/tuitionApi";
 *   import { applyForTuition } from "@/lib/api/applicationApi";
 *
 * `@/lib/api` থেকে সাধারণ হেল্পারও পাওয়া যায় (apiFetch, ApiError, API_URL)।
 */
export * from "./client";
export * from "./tuitionApi";
export * from "./applicationApi";
