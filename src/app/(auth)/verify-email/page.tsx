import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Verify your email"
      description="Confirming your college email address"
    >
      <Suspense>
        <VerifyEmailContent />
      </Suspense>
    </AuthCard>
  );
}
