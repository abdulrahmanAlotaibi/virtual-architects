import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted (see app/fonts/LICENSE.md), so builds and dev never depend on reaching Google Fonts.
const sans = localFont({ src: "./fonts/Nunito-Variable.woff2", weight: "200 1000", variable: "--font-nunito", display: "swap" });
const mono = localFont({ src: "./fonts/SourceCodePro-Variable.woff2", weight: "200 900", variable: "--font-scp", display: "swap" });

const description = "Make your company AI native today. AI made code cheap. Good decisions are still rare. Five virtual architects for Claude Code and GitHub Copilot bring the judgment of a seasoned team to every business change. You make the call.";

// Absolute URLs for the share image. Set NEXT_PUBLIC_SITE_URL to the deployed origin at build time.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Virtual Architects",
  description,
  openGraph: {
    type: "website",
    siteName: "Virtual Architects",
    title: "Virtual Architects",
    description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "Virtual Architects", description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfdf8" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1f1a" },
  ],
};

const themeScript =
  "try{var t=localStorage.getItem('theme'),r=document.documentElement;if(t==='dark'||t==='light')r.setAttribute('data-theme',t);else if(t==='system')r.removeAttribute('data-theme')}catch(e){}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint, so a saved dark theme never flashes light. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
