import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA DROPS — Artisan Techwear & Studio Goods",
  description:
    "Limited edition acoustic audio, daily techwear, and precision hardware. Powered by Telex Engine B autonomous payment recovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth bg-[#F5E3CD]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Modak&family=Mouse+Memoirs&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[#F5E3CD] text-[#4C0016] selection:bg-[#F91814] selection:text-white">
        {children}
      </body>
    </html>
  );
}
