import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import "~~/styles/globals.css";
import "./globals-init";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import type { Viewport } from "next";

export const metadata = getMetadata({
  title: "NestFi",
  description: "Decentralized Asset Management Protocol - Pool funds, deploy strategies, grow together.",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
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
      <body>
        <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
