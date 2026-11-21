import { TuitionDetailsSkeleton } from "@/components/dashboard/LoadingStates";

/**
 * `/tuitions/[id]` — সার্ভার-সাইড API ফetch চলাকালে ২-কলাম ডিটেইলস
 * লেআউটের (ব্যানার + ব্যাজ + বর্ণনা + স্টিকি সাইডবার) স্কেলেটন।
 */
export default function Loading() {
  return <TuitionDetailsSkeleton />;
}
