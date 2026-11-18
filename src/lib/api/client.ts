import { clearJwtCache, getJwt } from "./jwt";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** ব্যাকএন্ড থেকে আসা বা নেটওয়ার্কের এরর একভাবে ধরতে */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

/**
 * mentor-server (NEXT_PUBLIC_API_URL) এ রিকোয়েস্ট পাঠায়।
 *
 *  • `credentials: "include"` — ক্রস-অরিজিন কুকি যাওয়ার জন্য (সেশন-ভিত্তিক
 *    Next.js কল ও ভবিষ্যতের কুকি ফ্লোর জন্য অক্ষত)।
 *  • `Authorization: Bearer <JWT>` — mentor-server-এর প্রটেক্টেড রুট এই
 *    টোকেন verify করে (JWKS); টোকেন না থাকলে (পাবলিক/সাইন-আউট) হেডার যায় না।
 *  • ৪০১ এলে টোকেন একবার রিফ্রেশ করে রিট্রাই — মেয়াদোত্তীর্ণ টোকেনেও
 *    ইউজার ব্লক হবে না।
 */
export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, signal } = options;
  const requestBody = body !== undefined ? JSON.stringify(body) : undefined;

  const send = (token: string | null): Promise<Response> =>
    fetch(`${API_URL}${path}`, {
      method,
      signal,
      credentials: "include",
      headers: {
        ...(requestBody !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: requestBody,
    });

  let response: Response;
  try {
    const token = await getJwt();
    response = await send(token);

    if (response.status === 401 && token && !signal?.aborted) {
      clearJwtCache();
      const freshToken = await getJwt();
      if (freshToken && freshToken !== token) {
        response = await send(freshToken);
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(
      "Could not reach the server. Please try again later.",
      0
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : `Request failed with status ${response.status}.`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
