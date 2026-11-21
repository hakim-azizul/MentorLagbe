import {
  PublicPageSkeleton,
} from "@/components/dashboard/LoadingStates";

/**
 * `(root)` রুট গ্রুপের ইনস্ট্যান্ট লোডিং UI — হোম, প্রাইসিং, পেমেন্ট ও
 * অন্যান্য পাবলিক রুটে নেভিগেশনের সময় হিরো + কার্ড গ্রিডের স্কেলেটন দেখায়।
 * ডিটেইলস পেজের নিজস্ব `loading.tsx` এই ফলব্যাককে ওভাররাইড করে।
 */
export default function Loading() {
  return <PublicPageSkeleton />;
}
