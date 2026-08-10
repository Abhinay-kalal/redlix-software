"use client";

import { useEffect, useRef } from "react";

interface TurnstileProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export function Turnstile({ onSuccess }: TurnstileProps) {
  useEffect(() => {
    onSuccess("LOCALHOST_BYPASS_TOKEN");
  }, [onSuccess]);

  return null;
}
