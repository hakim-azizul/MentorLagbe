/**
 * ফ্রন্টএন্ড API সার্ভিস লেয়াং।
 *
 * UI কম্পোনেন্টে সরাসরি `fetch` না করে এই ফাংশনগুলো ইমপোর্ট করে ব্যবহার করুন:
 *   import { fetchApprovedTuitions } from "@/lib/api/tuitionApi";
 *   import { applyForTuition } from "@/lib/api/applicationApi";
 *
 * `@/lib/api` থেকে সাধারণ হেল্পারও পাওয়া যায় (apiFetch, ApiError, API_URL)।
 * টোকেন ব্যবস্থা (getJwt/clearJwtCache) `./jwt`-এ — apiFetch নিজেই ব্যবহার করে।
 */
export * from "./client";
export * from "./jwt";
export * from "./tuitionApi";
export * from "./applicationApi";
export * from "./userApi";
export * from "./paymentApi";
