import { apiFetch } from "./client";

/**
 * আবেদন সংক্রান্ত সার্ভিস — mentor-server-এর
 * `POST /api/applications` ও `GET /api/applications/check` এন্ডপয়েন্ট।
 */

/** পাবলিক আবেদন ফর্মের payload (ব্যাকএন্ড এই ফিল্ডগুলোই ভ্যালিডেট করে)। */
export type tApplyTuitionPayload = {
  tuitionId: string;
  studentEmail: string;
  studentName: string;
  preferredSchedule: string;
  note: string;
};

/** সফল আবেদনে ব্যাকএন্ড 201 + সৃষ্ট ডকুমেন্ট ফেরত দেয়। */
export type tApplyTuitionResult = {
  _id: string;
  status: "pending";
};

export type tApplicationCheck = {
  hasApplied: boolean;
};

/**
 * টিউশনের জন্য আবেদন জমা দেয়।
 * 400 = ফিল্ড মিসিং, 403 = শুধু ছাত্রছাত্রী আবেদন করতে পারবে,
 * 409 = একই টিউশনে ইতিমধ্যে আবেদন করা হয়েছে — সবই ApiError হিসেবে থাকে।
 */
export async function applyForTuition(
  applicationData: tApplyTuitionPayload
): Promise<tApplyTuitionResult> {
  return apiFetch<tApplyTuitionResult>("/api/applications", {
    method: "POST",
    body: applicationData,
  });
}

/** এই শিক্ষার্থী নির্দিষ্ট টিউশনে আগে আবেদন করেছে কিনা দেখায়। */
export async function checkStudentApplication(
  tuitionId: string,
  email: string
): Promise<tApplicationCheck> {
  const params = new URLSearchParams({ tuitionId, email });
  return apiFetch<tApplicationCheck>(`/api/applications/check?${params}`);
}
