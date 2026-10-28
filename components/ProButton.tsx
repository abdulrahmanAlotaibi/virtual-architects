"use client";

import { useId } from "react";
import { pro } from "@/content/site";

// The "Pro, soon" button: the most colorful control on the page, striped in the five
// architect tints. It opens a short note in the browser's native popover, which brings
// Escape-to-close, click-outside and focus return with it.
export default function ProButton({ size = "small" }: { size?: "small" | "normal" }) {
  const id = `pro-${useId().replace(/:/g, "")}`;
  return (
    <>
      <button type="button" className={`btn pro${size === "small" ? " small" : ""}`} popoverTarget={id}>
        <span className="pro-label">{pro.label}</span>
        <span className="pro-soon" aria-hidden="true">{pro.badge}</span>
        <span className="sr-only">, coming {pro.badge.toLowerCase()}</span>
      </button>
      <div id={id} popover="auto" className="pro-note" role="dialog" aria-labelledby={`${id}-h`}>
        <span className="pro-stripe" aria-hidden="true" />
        <h2 id={`${id}-h`}>{pro.title}</h2>
        <p>{pro.intro}</p>
        <ul className="pro-points">
          {pro.points.map((pt) => <li key={pt}>{pt}</li>)}
        </ul>
        <p className="pro-why">{pro.why}</p>
        <button type="button" className="btn small primary" popoverTarget={id} popoverTargetAction="hide">
          {pro.close}
        </button>
      </div>
    </>
  );
}
