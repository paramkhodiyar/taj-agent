import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taj Price Intelligence — Official Verification Engine",
  description: "Verified historical price discovery and intelligence for Taj hotels in India.",
  icons: {
    icon: "/taj-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-taj-cream text-taj-charcoal antialiased selection:bg-taj-burgundy selection:text-taj-cream font-sans">
        {children}
      </body>
    </html>
  );
}
