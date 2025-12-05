import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not configured. Newsletter subscriptions will not be saved.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for newsletter subscriber
export interface NewsletterSubscriber {
  id?: number;
  email: string;
  subscribed_at?: string;
  source?: string;
}
