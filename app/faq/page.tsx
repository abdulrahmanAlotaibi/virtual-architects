import type { Metadata } from "next";
import SubPage from "@/components/SubPage";
import { faq, faqHead } from "@/content/site";

export const metadata: Metadata = {
  title: "FAQ · Virtual Architects",
  description: faqHead.lede,
  openGraph: { title: "FAQ · Virtual Architects", description: faqHead.lede, url: "/faq" },
};

export default function Faq() {
  return (
    <SubPage file="faq.md" current="/faq">
      <header className="page-hero" id="top">
        <div className="wrap">
          <a className="page-back" href="/">← Home</a>
          <h1>{faqHead.title}</h1>
          <p className="lede">{faqHead.lede}</p>
        </div>
      </header>
      <section className="band" aria-label="Questions and answers">
        <div className="wrap">
          <div className="faq">
            {faq.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </SubPage>
  );
}
