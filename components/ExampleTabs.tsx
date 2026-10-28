"use client";

import { useEffect, useState, type ReactNode } from "react";

type Panel = { id: string; label: string; hint: string; content: ReactNode };

// The example picker on /examples. The tab follows the hash, so /examples#kyc opens the KYC
// example and a link to one of its steps (#kyc-5) opens it too.
export default function ExampleTabs({ panels }: { panels: Panel[] }) {
  const [active, setActive] = useState(panels[0].id);

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1).split("-")[0];
      if (panels.some((p) => p.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [panels]);

  function pick(id: string) {
    setActive(id);
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <>
      <div className="tabs ex-tabs" role="tablist" aria-label="Examples">
        {panels.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={active === p.id}
            aria-controls={`panel-${p.id}`}
            onClick={() => pick(p.id)}
          >
            <span className="tab-num">{i + 1}</span>
            <span className="tab-text">
              <span className="tab-label">{p.label}</span>
              <span className="tab-hint">{p.hint}</span>
            </span>
          </button>
        ))}
      </div>
      {panels.map((p) => (
        <div key={p.id} role="tabpanel" id={`panel-${p.id}`} aria-labelledby={`tab-${p.id}`} hidden={active !== p.id}>
          {p.content}
        </div>
      ))}
    </>
  );
}
