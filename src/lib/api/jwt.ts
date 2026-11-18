/**
 * Better Auth → mentor-server (Express) টোকেন সেতু।
 *
 * Better Auth সাইন-ইন করলে HTTP-only সেশন কুকি দেয় (Next.js-এর জন্য) এবং
 * `GET /api/auth/token` এন্ডপয়েন্ট থেকে JWT নেওয়া যায় (Express-এর জন্য)।
 * `apiFetch` এই টোকেন মেমরিতে ক্যাশ রেখে প্রতিটি mentor-server রিকোয়েস্টে
 * `Authorization: Bearer <JWT>` হেডারে পাঠায়।
 *
 * নিয়ম:
 *  • সার্ভার-সাইড (SSR) কলে টোকেন নেওয়া হয় না — পাবলিক এন্ডপয়েন্টই যায়।
 *  • টোকেন `exp`-এর ৩০ সেকেন্ড আগেই রিফ্রেশ হয়; ৪০১ এলে apiFetch একবার
 *    রিফ্রেশ করে আবার পাঠায় (নিচের ক্যাশ মুছে)।
 *  • সাইন-আউট হলে ক্যাশ মুছে ফেলতে হবে (`clearJwtCache`) — নাহলে পুরনো
 *    টোকেন মেয়াদ শেষ না হওয়া পর্যন্ত কাজ করতে থাকবে।
 */

const AUTH_BASE = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "");
const TOKEN_ENDPOINT = `${AUTH_BASE}/api/auth/token`;

/** সাইন-আউট অবস্থায় বারবার ব্যর্থ `/token` কল এড়াতে নেগেটিভ ক্যাশ। */
const NEGATIVE_CACHE_MS = 15_000;
/** নেটওয়ার্ক/ক্লক স্কিউ — টোকেন শেষ হওয়ার ঠিক আগেই রিফ্রেশ। */
const CLOCK_SKEW_MS = 30_000;

type JwtCacheEntry = {
  token: string | null;
  expiresAt: number;
};

let cache: JwtCacheEntry | null = null;
let inflight: Promise<string | null> | null = null;

/** JWT payload-এর `exp` (ms) পড়ে — লাইব্রেরি ছাড়া, শুধু ডিকোড। */
function decodeExp(token: string): number | null {
  try {
    const base64 = token.split(".")[1] ?? "";
    const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(normalized)) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Better Auth-এর `/api/auth/token` থেকে সেশন-JWT আনে (সাইন-আউট হলে null)। */
async function requestJwt(): Promise<string | null> {
  try {
    const response = await fetch(TOKEN_ENDPOINT, { credentials: "include" });
    if (!response.ok) return null;
    const data = (await response.json().catch(() => null)) as {
      token?: unknown;
    } | null;
    return typeof data?.token === "string" && data.token ? data.token : null;
  } catch {
    return null;
  }
}

/**
 * mentor-server কলের জন্য JWT — মেমরি-ক্যাশ সহ (সার্ভার-সাইডে সবসময় null)।
 * একাধিক কল একসাথে হলে একটিই `/token` রিকোয়েস্ট যায় (inflight শেয়ার)।
 */
export async function getJwt(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const now = Date.now();
  if (cache && now < cache.expiresAt) return cache.token;

  if (!inflight) {
    inflight = requestJwt()
      .then((token) => {
        const exp = token ? decodeExp(token) : null;
        cache = {
          token,
          expiresAt:
            token && exp !== null
              ? exp - CLOCK_SKEW_MS
              : now + NEGATIVE_CACHE_MS,
        };
        return token;
      })
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}

/** সাইন-ইন/সাইন-আউট/৪০১-রিট্রাইয়ের আগে ক্যাশ বাতিল করে নতুন টোকেন আনতে বাধ্য করে। */
export function clearJwtCache(): void {
  cache = null;
}
