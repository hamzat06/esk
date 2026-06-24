import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";
import GlobalToaster from "@/components/GlobalToaster";
import PushSetup from "@/components/PushSetup";
import { UserProfileProvider } from "@/lib/UseProfileProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "EddySylva Kitchen",
  description:
    "Authentic Nigerian cuisine in the United States. EddySylva Kitchen serves flavorful dishes like jollof rice and traditional African meals—freshly prepared and available for online ordering.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <Providers>
          <UserProfileProvider>
            {children}
            <GlobalToaster />
            <PushSetup />
          </UserProfileProvider>
        </Providers>
      </body>
    </html>
  );
}
