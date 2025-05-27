"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function CASCallback() {
  const searchParams = useSearchParams();
  const { verifyCASTicket, isLoading } = useAuth();
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    const ticket = searchParams.get("ticket");
    if (ticket && !hasVerified) {
      verifyCASTicket(ticket);
      setHasVerified(true);
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">
          {isLoading ? "Verifying your login..." : "Redirecting..."}
        </h2>
        <p className="text-gray-600">
          Please wait while we authenticate your session.
        </p>
      </div>
    </div>
  );
}
