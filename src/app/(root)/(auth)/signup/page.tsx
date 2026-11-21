import type { Metadata } from "next";
import SignUpForm from "./_components/SignUpForm";

export const metadata: Metadata = {
  title: "Create Your Account",
  description:
    "Join MentorLagbe as a student or tutor to find verified mentors, post tuitions and track your progress.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
