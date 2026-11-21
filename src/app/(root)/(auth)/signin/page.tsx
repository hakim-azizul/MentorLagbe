import type { Metadata } from "next";
import SignInForm from "./_components/SignInForm";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your MentorLagbe account to manage applications, saved tuitions and your dashboard.",
};

export default function SignInPage() {
  return <SignInForm />;
}
