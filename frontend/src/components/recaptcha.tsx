"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

declare global {
  interface Window {
    grecaptcha: {
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback': () => void;
          theme?: 'light' | 'dark';
          size?: 'normal' | 'compact';
        }
      ) => number;
      reset: (widgetId: number) => void;
      getResponse: (widgetId: number) => string;
    };
    onRecaptchaLoad?: () => void;
  }
}

interface ReCAPTCHAProps {
  onVerify: (token: string | null) => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

export interface ReCAPTCHARef {
  reset: () => void;
}

export const ReCAPTCHA = forwardRef<ReCAPTCHARef, ReCAPTCHAProps>(
  ({ onVerify, theme = 'light', size = 'normal' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current !== null && window.grecaptcha) {
          try {
            window.grecaptcha.reset(widgetIdRef.current);
            onVerify(null);
          } catch (error) {
            console.error("Failed to reset reCAPTCHA:", error);
          }
        }
      }
    }));

    useEffect(() => {
      // Initialize callback before loading script
      window.onRecaptchaLoad = () => {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (!siteKey || !containerRef.current) {
          console.error("reCAPTCHA site key is not defined or container not ready");
          return;
        }

        // Render the reCAPTCHA widget
        try {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token) => {
              onVerify(token);
            },
            'expired-callback': () => {
              onVerify(null);
            },
            theme,
            size
          });
        } catch (error) {
          console.error("reCAPTCHA error:", error);
        }
      };

      // Load the reCAPTCHA script
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return () => {
        // Cleanup
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        
        delete window.onRecaptchaLoad;
        
        // Reset the widget if it exists
        if (widgetIdRef.current !== null && window.grecaptcha) {
          try {
            window.grecaptcha.reset(widgetIdRef.current);
          } catch (error) {
            console.error("Failed to reset reCAPTCHA:", error);
          }
        }
      };
    }, [onVerify, theme, size]);

    // Return a container for the reCAPTCHA widget
    return <div ref={containerRef} className="mt-4 flex justify-center"></div>;
  }
);
