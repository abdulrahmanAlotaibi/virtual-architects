"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  // The id of the element that shows the text. If the clipboard is not available, its
  // text is selected instead so the reader can copy it by hand.
  target?: string;
  label?: string;
  className?: string;
};

export default function CopyButton({ text, target, label = "Copy", className = "" }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "selected">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function flash(next: "copied" | "selected") {
    setState(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), next === "copied" ? 1500 : 4000);
  }

  function selectTarget() {
    const el = target ? document.getElementById(target) : null;
    if (!el) return false;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    return true;
  }

  async function copy() {
    try {
      if (!navigator.clipboard) throw new Error("no clipboard");
      await navigator.clipboard.writeText(text);
      flash("copied");
    } catch {
      if (selectTarget()) flash("selected");
    }
  }

  const shown = state === "copied" ? "Copied" : state === "selected" ? "Selected" : label;
  return (
    <>
      <button type="button" className={`copy-btn ${className}`} data-state={state} onClick={copy}>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          {state === "copied" ? (
            <path d="M1 6h2v2h2V6h2V4h2V2h2v2H9v2H7v2H5v2H3V8H1z" fill="currentColor" />
          ) : (
            <>
              <rect x="0" y="0" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="4" y="4" width="8" height="8" fill="currentColor" />
            </>
          )}
        </svg>
        <span>{shown}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {state === "copied" ? "Copied to the clipboard" : state === "selected" ? "Text selected. Copy it with your keyboard." : ""}
      </span>
    </>
  );
}
