import { Toaster } from "@/components/ui/sonner";
import ClientProvider from "@/HOC/ClientProvider";
import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const font = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://family-social.site"), // Add metadataBase for absolute URLs
  title: "Family Social Site",
  description: "A social platform built by family for family.",
  keywords: ["family", "social", "platform", "community", "sharing"],
  authors: [{ name: "Family Social Team" }],
  creator: "Family Social Team",
  publisher: "Family Social Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Open Graph tags for social sharing
  openGraph: {
    title: "Family Social Site",
    description: "A social platform built by family for family.",
    url: "https://family-social.site", // Updated to match metadataBase
    siteName: "Family Social Site",
    images: [
      {
        url: "/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "Family Social Site Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // Twitter Card tags
  twitter: {
    card: "summary_large_image",
    title: "Family Social Site",
    description: "A social platform built by family for family.",
    images: ["/web-app-manifest-512x512.png"],
    creator: "@your-twitter-handle", // Replace with your actual Twitter handle
  },
  // Apple-specific tags
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Family Social",
    startupImage: [
      {
        url: "/apple-icon.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  // PWA-related tags
  applicationName: "Family Social Site",
  referrer: "origin-when-cross-origin",
  category: "social",
  // Icons and manifest
  icons: {
    icon: [
      {
        url: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-icon.png",
      },
    ],
  },
  manifest: "/manifest.json",
};

// Export viewport separately (new Next.js requirement)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional favicon sizes for better compatibility */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/web-app-manifest-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/web-app-manifest-192x192.png"
        />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color for browser UI */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta
          name="msapplication-TileImage"
          content="/web-app-manifest-192x192.png"
        />

        {/* Apple Web App specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Family Social" />

        {/* Additional Open Graph tags for better social sharing */}
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:type" content="image/png" />

        {/* Prevent automatic detection of possible phone numbers */}
        <meta name="format-detection" content="telephone=no" />

        {/* Robots meta tag */}
        <meta name="robots" content="index, follow" />

        {/* Canonical URL - Update this with your actual domain */}
        <link rel="canonical" href="https://faimily-social.site" />
      </head>
      <body className={`${font.className} antialiased`}>
        <ClientProvider>
          {children}
          <Toaster />
        </ClientProvider>
      </body>
    </html>
  );
}
