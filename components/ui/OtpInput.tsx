"use client";

import React, { useRef, useEffect } from "react";

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

export default function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  useEffect(() => {
    // Auto focus the first empty input
    const firstEmpty = digits.findIndex((d) => !d);
    const targetIdx = firstEmpty === -1 ? 5 : firstEmpty;
    if (inputsRef.current[targetIdx]) {
      inputsRef.current[targetIdx]?.focus();
    }
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      // Empty
      const newDigits = [...digits];
      newDigits[index] = "";
      onChange(newDigits.join(""));
      return;
    }

    // If typing single digit
    const char = val.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    onChange(newDigits.join(""));

    // Advance focus
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      const nextFocus = Math.min(pastedData.length, 5);
      inputsRef.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2.5">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[index]}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`w-12 h-16 sm:w-14 sm:h-18 text-center text-xl sm:text-2xl font-mono text-neutral-900 bg-white border transition-all outline-none ${
            digits[index]
              ? "border-black font-semibold shadow-sm"
              : "border-neutral-300 focus:border-black"
          } disabled:opacity-50`}
        />
      ))}
    </div>
  );
}
