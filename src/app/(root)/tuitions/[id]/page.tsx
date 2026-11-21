import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { fetchTuitionById } from "@/lib/api/tuitionApi";
import type { tTuitionDetails } from "@/lib/types/tuition";
import TuitionDetails from "./_components/TuitionDetails";

// প্রতি রিকোয়েস্টে ফ্রেশ ডেটা — বিল্ড-টাইমে ব্যাকএন্ড টানে না
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const tuition = await fetchTuitionById(id);
    const tutorName = tuition.tutor?.name || tuition.tutorName || "a verified tutor";
    return {
      title: tuition.title,
      description: `${tuition.subject} · ${tuition.classLevel} · ${tuition.mode} tuition with ${tutorName}. ${tuition.description}`.slice(
        0,
        160
      ),
    };
  } catch {
    return { title: "Tuition Details" };
  }
}

export default async function TuitionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let tuition: tTuitionDetails;
  try {
    tuition = await fetchTuitionById(id);
  } catch (error) {
    // অবৈধ/অজানা id → Next.js-এর স্ট্যান্ডার্ড 404 পেজ
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return <TuitionDetails tuition={tuition} />;
}
