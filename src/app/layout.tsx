import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CampusOS — The Student Operating System",
    template: "%s | CampusOS",
  },
  description:
    "CampusOS brings attendance, timetable, notes, PYQs, internships, and AI study tools into one place for college students.",
  keywords: [
    "campus",
    "student dashboard",
    "attendance tracker",
    "college notes",
    "assignment tracker",
    "study planner",
  ],
  authors: [{ name: "CampusOS" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "CampusOS — The Student Operating System",
    description:
      "Attendance, timetable, notes, PYQs, internships, and AI study tools in one place for college students.",
    siteName: "CampusOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusOS — The Student Operating System",
    description:
      "Attendance, timetable, notes, PYQs, internships, and AI study tools in one place for college students.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
