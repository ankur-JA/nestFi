"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Header } from "~~/components/Header";
import { Footer } from "~~/components/Footer";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { ThemeContextProvider, useTheme } from "~~/contexts/ThemeContext";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Pages with their own layouts (no header/footer needed)
  const isHome = pathname === "/";
  const hasCustomLayout = pathname.startsWith("/curator") || pathname.startsWith("/investor") || isHome;

  const toastStyle = {
    background: isDark ? '#12121a' : '#ffffff',
    color: isDark ? '#fff' : '#0f172a',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
  };

  // If page has custom layout, render children directly
  if (hasCustomLayout) {
    return (
      <>
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{ style: toastStyle }}
        />
      </>
    );
  }

  // Default layout with header and footer
  return (
    <>
      <div 
        className="flex flex-col min-h-screen transition-colors duration-300"
        style={{ background: isDark ? '#0a0a0f' : '#ffffff' }}
      >
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster 
        position="bottom-right"
        toastOptions={{ style: toastStyle }}
      />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const RainbowKitWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  
  const rainbowTheme = theme === "dark" 
    ? darkTheme({
        accentColor: '#10b981',
        accentColorForeground: 'white',
        borderRadius: 'medium',
        fontStack: 'system',
      })
    : lightTheme({
        accentColor: '#10b981',
        accentColorForeground: 'white',
        borderRadius: 'medium',
        fontStack: 'system',
      });

  return (
    <RainbowKitProvider avatar={BlockieAvatar} theme={rainbowTheme}>
      {children}
    </RainbowKitProvider>
  );
};

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeContextProvider>
          <RainbowKitWrapper>
            <ProgressBar height="3px" color="#10b981" />
            <ScaffoldEthApp>{children}</ScaffoldEthApp>
          </RainbowKitWrapper>
        </ThemeContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
