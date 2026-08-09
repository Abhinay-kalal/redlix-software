"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import React, {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type SmoothInputProps = ComponentPropsWithoutRef<"input"> & {
  wrapperClassName?: string;
  error?: boolean;
};

const PASSWORD_CHAR =
  typeof navigator !== "undefined" && navigator.userAgent.match(/firefox|fxios/i)
    ? "\u25CF"
    : "\u2022";

export const SmoothInput = React.forwardRef<HTMLInputElement, SmoothInputProps>(
  (
    {
      className,
      wrapperClassName,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      type = "text",
      placeholder,
      style,
      error,
      ...props
    },
    forwardedRef
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    const caretX = useMotionValue(0);
    const caretOpacity = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const internalInputRef = useRef<HTMLInputElement>(null);
    const inputRef = (forwardedRef as React.RefObject<HTMLInputElement>) || internalInputRef;
    const measureRef = useRef<HTMLSpanElement>(null);
    const prefersReducedMotion = useReducedMotion();

    const isControlled = value !== undefined;

    const springCaretX = useSpring(
      caretX,
      prefersReducedMotion
        ? { stiffness: 10000, damping: 100, mass: 0.1 }
        : { stiffness: 500, damping: 30, mass: 0.5 }
    );

    const inputValue = isControlled ? String(value) : internalValue;

    const syncMeasureSpan = () => {
      const input = inputRef.current;
      const measureSpan = measureRef.current;
      if (!input || !measureSpan) return;

      const styles = window.getComputedStyle(input);
      const isPassword = input.type === "password";

      let fontSize = styles.fontSize;
      if (
        PASSWORD_CHAR === "\u2022" &&
        isPassword &&
        typeof navigator !== "undefined" &&
        !navigator.userAgent.match(/chrome|chromium|crios/i)
      ) {
        fontSize = `${parseFloat(fontSize) + 6.25}px`;
      }

      measureSpan.style.fontStyle = styles.fontStyle;
      measureSpan.style.fontWeight = styles.fontWeight;
      measureSpan.style.fontSize = fontSize;
      measureSpan.style.fontFamily = styles.fontFamily;
      measureSpan.style.letterSpacing = styles.letterSpacing;
      measureSpan.style.fontFeatureSettings = styles.fontFeatureSettings;
      measureSpan.style.fontVariationSettings = styles.fontVariationSettings;
    };

    const measurePrefixWidth = (text: string) => {
      const input = inputRef.current;
      const measureSpan = measureRef.current;
      if (!input || !measureSpan) return null;

      syncMeasureSpan();
      measureSpan.textContent = text;

      const styles = window.getComputedStyle(input);
      const paddingLeft = parseFloat(styles.paddingLeft) || 0;
      const textWidth = measureSpan.getBoundingClientRect().width;

      return textWidth + paddingLeft;
    };

    const scrollCaretIntoView = (
      target: HTMLInputElement,
      absoluteWidth: number
    ) => {
      const styles = window.getComputedStyle(target);
      const paddingLeft = parseFloat(styles.paddingLeft) || 0;
      const paddingRight = parseFloat(styles.paddingRight) || 0;
      const maxScroll = Math.max(0, target.scrollWidth - target.clientWidth);
      const visibleRight = target.scrollLeft + target.clientWidth - paddingRight;
      const visibleLeft = target.scrollLeft + paddingLeft;

      if (absoluteWidth > visibleRight) {
        target.scrollLeft = Math.min(
          absoluteWidth - target.clientWidth + paddingRight,
          maxScroll
        );
        return;
      }

      if (absoluteWidth < visibleLeft) {
        target.scrollLeft = Math.max(0, absoluteWidth - paddingLeft);
      }
    };

    const getCaretIndex = (target: HTMLInputElement) => {
      const selectionStart = target.selectionStart ?? 0;
      const selectionEnd = target.selectionEnd ?? 0;

      if (selectionStart === selectionEnd) {
        return selectionStart;
      }

      return target.selectionDirection === "backward"
        ? selectionStart
        : selectionEnd;
    };

    const updateCaretFromInput = (target: HTMLInputElement) => {
      const selectionStart = target.selectionStart ?? 0;
      const selectionEnd = target.selectionEnd ?? 0;
      const hasSelection = selectionStart !== selectionEnd;
      const caretIndex = getCaretIndex(target);
      const isPassword = target.type === "password";
      const textBeforeCaret = isPassword
        ? PASSWORD_CHAR.repeat(caretIndex)
        : target.value.slice(0, caretIndex);

      const absoluteWidth = measurePrefixWidth(textBeforeCaret);
      if (absoluteWidth === null) return;

      scrollCaretIntoView(target, absoluteWidth);

      const styles = window.getComputedStyle(target);
      const paddingLeft = parseFloat(styles.paddingLeft) || 0;
      const paddingRight = parseFloat(styles.paddingRight) || 0;
      const caretPosition = absoluteWidth - target.scrollLeft;
      const minX = paddingLeft - 1;
      const maxX = target.clientWidth - paddingRight;
      const isCaretVisible =
        caretPosition >= minX && caretPosition <= maxX + 1;

      caretX.set(Math.min(caretPosition, maxX));

      if (!isCaretVisible || hasSelection) {
        caretOpacity.set(0);
        return;
      }

      caretOpacity.set(1);
    };

    const updateCaretRef = useRef(updateCaretFromInput);
    updateCaretRef.current = updateCaretFromInput;
    const caretOpacityRef = useRef(caretOpacity);
    caretOpacityRef.current = caretOpacity;

    useEffect(() => {
      const input = inputRef.current;
      if (input && document.activeElement === input) {
        updateCaretRef.current(input);
      }
    }, [inputValue, type]);

    useEffect(() => {
      const input = inputRef.current;
      const container = containerRef.current;
      if (!input || !container) return;

      const updateCaretIfFocused = () => {
        if (document.activeElement === input) {
          updateCaretRef.current(input);
        }
      };

      const handleSelectionChange = () => {
        if (document.activeElement !== input) return;

        requestAnimationFrame(() => {
          if (document.activeElement === input) {
            updateCaretRef.current(input);
          }
        });
      };

      document.addEventListener("selectionchange", handleSelectionChange);
      document.fonts?.addEventListener("loadingdone", updateCaretIfFocused);
      if (document.fonts?.ready) {
        void document.fonts.ready.then(updateCaretIfFocused);
      }
      input.addEventListener("scroll", updateCaretIfFocused);

      const resizeObserver = new ResizeObserver(updateCaretIfFocused);
      resizeObserver.observe(container);

      updateCaretIfFocused();

      return () => {
        document.removeEventListener("selectionchange", handleSelectionChange);
        document.fonts?.removeEventListener("loadingdone", updateCaretIfFocused);
        input.removeEventListener("scroll", updateCaretIfFocused);
        resizeObserver.disconnect();
      };
    }, []);

    return (
      <div
        className={cn(
          "relative w-full rounded-lg bg-white transition-all border",
          error
            ? "border-[#E61E32] focus-within:ring-2 focus-within:ring-[#E61E32]/20"
            : "border-zinc-300 focus-within:border-[#E61E32] focus-within:ring-2 focus-within:ring-[#E61E32]/20",
          wrapperClassName
        )}
      >
        <div
          ref={containerRef}
          className="relative grid grid-cols-1 p-0"
          style={{ caretColor: "transparent" }}
        >
          <input
            {...props}
            ref={inputRef}
            type={type}
            placeholder={placeholder}
            className={cn(
              "w-full bg-transparent text-sm py-2.5 px-3.5 outline-none placeholder:text-zinc-400 text-zinc-900 col-start-1 col-end-2 row-start-1 row-end-2",
              className
            )}
            style={style}
            value={inputValue}
            onChange={(e) => {
              if (!isControlled) setInternalValue(e.target.value);
              onChange?.(e);
              requestAnimationFrame(() => {
                updateCaretRef.current(e.target);
              });
            }}
            onFocus={(e) => {
              onFocus?.(e);
              requestAnimationFrame(() => {
                updateCaretRef.current(e.target);
              });
            }}
            onBlur={(e) => {
              caretOpacityRef.current.set(0);
              onBlur?.(e);
            }}
          />
          <span
            ref={measureRef}
            aria-hidden
            className="pointer-events-none invisible absolute top-0 left-0 whitespace-pre p-0 m-0 border-0"
          />
          <motion.div
            className="bg-[#E61E32] pointer-events-none col-start-1 col-end-2 row-start-1 row-end-2 h-[1.1em] w-0.5 self-center rounded-full"
            style={{ x: springCaretX, opacity: caretOpacity }}
          />
        </div>
      </div>
    );
  }
);

SmoothInput.displayName = "SmoothInput";
