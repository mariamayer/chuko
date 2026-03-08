import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/lib/theme";
import "@/assets/styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const kaio = localFont({
  src: [
    { path: "../assets/fonts/KaioTRIAL-Light-BF65f24de1e5854.otf", weight: "300" },
    { path: "../assets/fonts/KaioTRIAL-Regular-BF65f24de206d9d.otf", weight: "400" },
    { path: "../assets/fonts/KaioTRIAL-Medium-BF65f24de1b8279.otf", weight: "500" },
    { path: "../assets/fonts/KaioTRIAL-Bold-BF65f24de19552f.otf", weight: "700" },
    { path: "../assets/fonts/KaioTRIAL-Black-BF65f24de1e055e.otf", weight: "900" },
  ],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "merch7am · Agent Dashboard",
  description: "AI agent management dashboard for merch7am",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${kaio.variable}`} suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply stored theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('m7am-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} font-sans bg-theme text-theme antialiased transition-colors duration-200`}
      >
        <Providers>
          <ThemeProvider>{children}</ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
