import { redirect } from "next/navigation";

/**
 * `/pricing` — নেভবার, ফুটার ও ড্যাশবোর্ডের "Upgrade to Pro" লিংকগুলো এখানে
 * আসে। আলাদা প্রাইসিং পেজ না রেখে রোল-অনুযায়ী Pro প্ল্যান ও চেকআউট
 * বাটনসহ `/payment`-এ পাঠানো হয়।
 */
export default function PricingPage() {
  redirect("/payment");
}
