"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

interface ReCAPTCHAProps {
  onVerify: (token: string | null) => void;
}

const isAuthPath = (pathname: string) => {
  return pathname.startsWith("/auth");
};

export function ReCAPTCHA({ onVerify }: ReCAPTCHAProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !isAuthPath(pathname)) return;

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      console.error("reCAPTCHA site key is not configured");
      return;
    }

    // Function to render the captcha
    const renderCaptcha = () => {
      if (!containerRef.current || !window.grecaptcha?.render) return;

      try {
        // Reset if already rendered
        if (widgetId.current !== null && window.grecaptcha?.reset) {
          window.grecaptcha.reset(widgetId.current);
          return;
        }

        // Initial render
        widgetId.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          "expired-callback": () => onVerify(null),
          "error-callback": () => onVerify(null),
          theme: "light",
          size: "normal",
        });
      } catch (error) {
        console.error("Error rendering reCAPTCHA:", error);
      }
    };

    // Create callback for script load
    window.onRecaptchaLoad = renderCaptcha;

    // Load the reCAPTCHA script if not already loaded
    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api/siteverify?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (window.grecaptcha?.render) {
      renderCaptcha();
    }

    // Cleanup on unmount or pathname change
    return () => {
      if (widgetId.current !== null && window.grecaptcha?.reset) {
        try {
          window.grecaptcha.reset(widgetId.current);
        } catch (error) {
          console.error("Error resetting reCAPTCHA:", error);
        }
      }
      onVerify(null);

      // Remove script if navigating away from auth paths
      if (!isAuthPath(pathname)) {
        const script = document.querySelector('script[src*="recaptcha/api.js"]');
        if (script) {
          script.remove();
        }
      }
    };
  }, [onVerify, pathname]);

  // Don't render the container if not on an auth path
  if (!isAuthPath(pathname)) {
    return null;
  }

  return (
    <div ref={containerRef} className="flex justify-center my-4" />
  );
}
