import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Type for newsletter subscriber
export interface NewsletterSubscriber {
  id?: number;
  email: string;
  subscribed_at?: string;
  source?: string;
}

// Lazy client creation - only create when credentials are available
export const getSupabaseClient = (): SupabaseClient | null => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return null;
  }
};
