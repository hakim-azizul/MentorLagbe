import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const isDynamicUsageError = (error: unknown) => {
    const digest = (error as { digest?: string } | null)?.digest;
    return (
        digest === "DYNAMIC_SERVER_USAGE" ||
        (error instanceof Error &&
            error.message.includes("Dynamic server usage"))
    );
}

const lookupSession = async () =>
    auth.api.getSession({
        headers: await headers(),
    });

/**
 * সার্ভার-সাইড সেশন লুকআপ।
 *
 * MongoDB-তে transient সমস্যা (DNS/network blip) হলে better-auth APIError
 * ("Failed to get session") ফেলে যায়। আগে এখান থেকে সরাসরি null ফেরত দেওয়ায়
 * guard ভুল করে /signin-এ রিডাইরেক্ট করত। এখন একবার রিট্রাই করা হয় — তবুও
 * ব্যর্থ হলেই signed-out হিসেবে treating করে পেজ ক্র্যাশ এড়ানো যায়।
 */
export const getSession = async () => {
    "use server";
    try {
        return await lookupSession();
    } catch (error) {
        // Next-এর ইন্টারনাল dynamic-usage সিগন্যাল rethrow না করলে রুট ভুলভাবে
        // static থেকে যেতে পারে — তাই এটি সবসময়ই আগে চেক করি।
        if (isDynamicUsageError(error)) throw error;

        console.error("[auth] getSession failed, retrying once:", error);
        try {
            await new Promise((resolve) => setTimeout(resolve, 50));
            return await lookupSession();
        } catch (retryError) {
            if (isDynamicUsageError(retryError)) throw retryError;
            console.error(
                "[auth] getSession retry failed, treating as signed out:",
                retryError
            );
            return null;
        }
    }
};
