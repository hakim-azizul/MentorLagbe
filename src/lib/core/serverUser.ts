import { auth } from "@/lib/auth"
import { headers } from "next/headers"

/**
 * সার্ভার-সাইড সেশন লুকআপ।
 *
 * MongoDB-তে transient সমস্যা (DNS/network blip) হলে better-auth APIError
 * ("Failed to get session") ফেলে যায়, যা পুরো পেজ রেন্ডার ভেঙে দিত।
 * এখানে সেটিকে ধরে `null` ফেরত দেওয়া হয় — সেশন না থাকলে ইউজার সাইন-আউট
 * অবস্থায় দেখাবে, পেজ ক্র্যাশ করবে না।
 */
export const getSession = async () => {
    "use server";
    try {
        return await auth.api.getSession({
            headers: await headers(),
        });
    } catch (error) {
        // Next-এর ইন্টার্নাল dynamic-usage সিগন্যাল (static প্রিরেন্ডারে headers()
        // কল) — এটি ধরে নিলে রুট ভুলভাবে static থেকে যেতে পারে, তাই রিথ্রো
        const digest = (error as { digest?: string } | null)?.digest;
        if (
            digest === "DYNAMIC_SERVER_USAGE" ||
            (error instanceof Error &&
                error.message.includes("Dynamic server usage"))
        ) {
            throw error;
        }
        console.error("[auth] getSession failed, treating as signed out:", error);
        return null;
    }
};
