import { getSupabaseClient } from "./supabase";

/**
 * Track a page view for the landing page
 */
export const trackPageView = async (): Promise<boolean> => {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    // In development, just log
    console.log("Page view tracked (Supabase not configured)");
    return false;
  }

  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    const monthKey = `${year}-${month.toString().padStart(2, "0")}`; // e.g., "2025-01"

    // Try to increment existing count for this month
    const { data: existing } = await supabase
      .from("page_views")
      .select("count")
      .eq("page", "landing")
      .eq("month_key", monthKey)
      .single();

    if (existing && existing.count) {
      // Update existing count (increment)
      const { error } = await supabase
        .from("page_views")
        .update({ count: (existing.count as number) + 1 })
        .eq("page", "landing")
        .eq("month_key", monthKey);

      if (error) {
        console.error("Error updating page view:", error);
        return false;
      }
    } else {
      // Create new entry for this month
      const { error } = await supabase
        .from("page_views")
        .insert([
          {
            page: "landing",
            month_key: monthKey,
            year: year,
            month: month,
            count: 1,
          },
        ]);

      if (error) {
        console.error("Error inserting page view:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error tracking page view:", error);
    return false;
  }
};

/**
 * Get current month's page view count
 */
export const getCurrentMonthViews = async (): Promise<number> => {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return 0;
  }

  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthKey = `${year}-${month.toString().padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("page_views")
      .select("count")
      .eq("page", "landing")
      .eq("month_key", monthKey)
      .single();

    if (error || !data) {
      return 0;
    }

    return (data.count as number) || 0;
  } catch (error) {
    console.error("Error getting page views:", error);
    return 0;
  }
};
