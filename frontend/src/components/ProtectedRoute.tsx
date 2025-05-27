"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !pathname.startsWith("/auth")) {
      if (pathname !== "/") router.push("/auth/login");
      else
        setTimeout(() => {
          router.push("/auth/login");
        }, 5000);
    }

    if (!isLoading && isAuthenticated && pathname.startsWith("/auth")) {
      router.push("/profile");
    }

    if (!isLoading && isAuthenticated && pathname === "/") {
      setTimeout(() => {
        router.push("/explore");
      }, 5000);
    }
  }, [isAuthenticated, isLoading, pathname]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated && !pathname.startsWith("/auth")) {
    return null;
  }

  return <>{children}</>;
}
