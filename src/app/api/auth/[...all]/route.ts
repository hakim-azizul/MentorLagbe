import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

/** MongoDB অসুবিধায় better-auth "Failed to get session" (500) পাঠায়। */
function isSessionReadFailure(payload: unknown): boolean {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "code" in payload &&
        (payload as { code?: unknown }).code === "FAILED_TO_GET_SESSION"
    );
}

/** সেশন-রিড ব্যরিহলে signed-out (`null`) রেসপন্স — useSession ক্র্যাশ করবে না। */
function signedOutResponse(): Response {
    return new Response("null", {
        status: 200,
        headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
        },
    });
}

/**
 * GET /api/auth/get-session
 *
 * better-auth-এর আসল হ্যান্ডলার সাময়িক DB/নেটওয়ার্ক ত্রুটিতে 500 রিটার্ন করে —
 * ব্রাউজারে `Uncaught APIError: Failed to get session` হয়। এখানে সেই
 * নির্দিষ্ট ত্রুটি ধরে 200 + `null` (সাইন-আউট) ফেরত দেওয়া হয়; অন্য সব
 * এরর (401/403/405 ইত্যাদি) অক্ষত যায়।
 */
export async function GET(request: Request): Promise<Response> {
    let response: Response;
    try {
        response = await handlers.GET(request);
    } catch (error) {
        if (!isSessionReadFailure(error)) throw error;
        console.error("[auth] get-session degraded to signed-out:", error);
        return signedOutResponse();
    }

    if (response.ok) return response;

    // বডি খেয়ে না ফেলতে clone করে দেখা হচ্ছে
    const clone = response.clone();
    const payload = await clone.json().catch(() => null);
    if (isSessionReadFailure(payload)) {
        console.error(
            `[auth] get-session ${response.status} degraded to signed-out:`,
            payload
        );
        return signedOutResponse();
    }

    return response;
}

/** POST/PATCH/PUT/DELETE — সাইন-ইন/আউট ইত্যাদি, এরর অক্ষত যাবে। */
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
