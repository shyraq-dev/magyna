import type { Metadata } from "next";
import Script from "next/script";
import { PT_Serif, PT_Sans, Merriweather } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelegramAutoAuth from "@/components/TelegramAutoAuth";
import "./globals.css";

const display = PT_Serif({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});

const body = PT_Sans({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

// Offered as a reading-screen font option alongside the display/body pair.
const merriweather = Merriweather({
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "700"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "Мағына — Оқы. Түсін. Жаз. Бөліс.",
  description:
    "Қазақ тіліндегі кітап оқу және жазу платформасы. Жеке сөреңізді жинаңыз, авторлардың жаңа туындыларын оқыңыз.",
};

// Every page renders personalized nav (auth state, admin/writer links) via
// the Navbar below. Without forcing this, Next.js can decide a route has
// no dynamic dependencies and cache/prerender it once — which is exactly
// how one person's admin state can leak into what other people see.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kk" className={`${display.variable} ${body.variable} ${merriweather.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('magyna:app-theme') || 'system';
                var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (dark) document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <TelegramAutoAuth />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
