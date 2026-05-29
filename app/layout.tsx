import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ChatWidget } from "@/components/ai/ChatWidget";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Advancia Training",
    template: "%s · Advancia Training",
  },
  description: "Learn online and on-site — courses, sessions, certificates.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeBootstrap = `
(function(){
  try {
    var m = document.cookie.match(/(?:^|; )theme=([^;]+)/);
    var t = m ? decodeURIComponent(m[1]) : "";
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = t === 'dark' || (!t && prefersDark);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const localeCookie = cookieStore.get("locale")?.value;
  const locale = localeCookie ?? "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  const initialTheme: "light" | "dark" | "system" =
    themeCookie === "dark" || themeCookie === "light" ? themeCookie : "system";
  const ssrDark = themeCookie === "dark";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${notoArabic.variable}${ssrDark ? " dark" : ""}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-dvh bg-bg text-fg antialiased">
        <SessionProvider>
          <ThemeProvider initialTheme={initialTheme}>
            {children}
            <ChatWidget />
            <Toaster
              position="top-center"
              toastOptions={{
                className: "!bg-card !text-fg !border !border-border",
                style: { background: "var(--color-card)", color: "var(--color-fg)" },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
