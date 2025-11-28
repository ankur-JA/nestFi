// Suppress indexedDB SSR warnings from wagmi/wallet connectors
if (typeof window === "undefined") {
  // Only run on server
  const noop = () => {};
  
  // Suppress unhandled rejection warnings for indexedDB in development
  if (process.env.NODE_ENV === "development") {
    process.on("unhandledRejection", (reason: any) => {
      if (reason && reason.message && reason.message.includes("indexedDB")) {
        // Silently ignore indexedDB errors during SSR
        return;
      }
      // Let other errors through
      console.error("Unhandled Rejection:", reason);
    });
  }
}

export {};

