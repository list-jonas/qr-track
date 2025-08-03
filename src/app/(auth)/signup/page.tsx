import { SignupForm } from "@/components/auth/signup-form";
import { redirect } from "next/navigation";

const REGISTRATION_LOCKED = process.env.NEXT_PUBLIC_REGISTRATION_LOCKED === "true";

export default function SignupPage() {
  if (REGISTRATION_LOCKED) {
    redirect("/login?reason=registration_locked");
  }
  return (
    <div className="bg-muted flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignupForm />
      </div>
    </div>
  );
}
