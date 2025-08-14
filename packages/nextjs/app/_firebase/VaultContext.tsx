// app/_firebase/VaultContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  Auth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Declare global variables for Firebase config and auth token
declare const __app_id: string | undefined;
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;

interface VaultContextType {
  db: Firestore | null;
  auth: Auth | null;
  userId: string | null;
  isAuthReady: boolean;
  appId: string;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

// Helper function to generate UUID with fallback
const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const VaultProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [appId, setAppId] = useState<string>("default-app-id"); // Default for local dev

  useEffect(() => {
    try {
      // Safely access global variables, providing fallbacks for local development
      const currentAppId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
      const firebaseConfig = typeof __firebase_config !== "undefined" ? JSON.parse(__firebase_config) : {};
      const initialAuthToken = typeof __initial_auth_token !== "undefined" ? __initial_auth_token : undefined;

      if (Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase config is missing. Please ensure __firebase_config is properly set.");
        return;
      }

      setAppId(currentAppId);

      const firebaseApp = initializeApp(firebaseConfig);
      const firestore = getFirestore(firebaseApp);
      const firebaseAuth = getAuth(firebaseApp);

      setDb(firestore);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (!user) {
          // If no user, try to sign in with custom token or anonymously
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } else {
              await signInAnonymously(firebaseAuth);
            }
          } catch (error) {
            console.error("Firebase authentication error:", error);
          }
        }
        // After authentication attempt, get the user ID
        setUserId(firebaseAuth.currentUser?.uid || generateUUID());
        setIsAuthReady(true); // Mark authentication as ready
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      setIsAuthReady(true); // Ensure auth is ready even on error to unblock rendering
    }
  }, []);

  return (
    <VaultContext.Provider value={{ db, auth, userId, isAuthReady, appId }}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVaultContext = () => {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVaultContext must be used within a VaultProvider");
  }
  return context;
};

export default VaultContext;
