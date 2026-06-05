"use client";

import { useEffect, useRef } from "react";

interface TurnstileProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export function Turnstile({ onSuccess, onError, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onSuccess, onError, onExpire });

  useEffect(() => {
    callbacksRef.current = { onSuccess, onError, onExpire };
  });

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      return;
    }

    let isMounted = true;

    const loadScript = () => {
      if (document.getElementById("cloudflare-turnstile-script")) {
        initializeWidget();
        return;
      }

      const script = document.createElement("script");
      script.id = "cloudflare-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (isMounted) initializeWidget();
      };
      document.body.appendChild(script);
    };

    const initializeWidget = () => {
      if (!isMounted || !containerRef.current) return;
      if (!(window as any).turnstile) {
        setTimeout(initializeWidget, 100);
        return;
      }

      try {
        if (widgetIdRef.current) {
          (window as any).turnstile.remove(widgetIdRef.current);
        }

        const widgetId = (window as any).turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            if (isMounted) callbacksRef.current.onSuccess(token);
          },
          "error-callback": () => {
            if (isMounted && callbacksRef.current.onError) callbacksRef.current.onError();
          },
          "expired-callback": () => {
            if (isMounted && callbacksRef.current.onExpire) callbacksRef.current.onExpire();
          },
        });
        widgetIdRef.current = widgetId;
      } catch (err) {
        console.error(err);
      }
    };

    loadScript();

    return () => {
      isMounted = false;
      if (widgetIdRef.current && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch {}
      }
    };
  }, []);

  return <div ref={containerRef} className="my-2 flex justify-start" />;
}
