import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NestFi Documentation - Coming Soon",
  description: "Comprehensive documentation for NestFi - Decentralized Asset Management Protocol",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('nestfi-theme') || 'dark';
                  const html = document.documentElement;
                  html.setAttribute('data-theme', theme);
                  if (theme === 'light') {
                    html.classList.remove('dark');
                    html.classList.add('light');
                  } else {
                    html.classList.remove('light');
                    html.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
