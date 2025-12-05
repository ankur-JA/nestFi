import { getSupabaseClient } from "./supabase";

/**
 * Track a page view for the landing page
 */
export const trackPageView = async (): Promise<boolean> => {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.log("Page view tracked (Supabase not configured)");
    return false;
  }

  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    const monthKey = `${year}-${month.toString().padStart(2, "0")}`; // e.g., "2025-01"

    // First, check if record exists
    const { data: existing, error: selectError } = await supabase
      .from("page_views")
      .select("count")
      .eq("page", "landing")
      .eq("month_key", monthKey)
      .maybeSingle();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 is "not found" which is fine
      console.error("Error checking page view:", selectError);
      return false;
    }

    if (existing && existing.count !== null && existing.count !== undefined) {
      // Record exists, increment count
      const { error: updateError } = await supabase
        .from("page_views")
        .update({ count: (existing.count as number) + 1 })
        .eq("page", "landing")
        .eq("month_key", monthKey);

      if (updateError) {
        console.error("Error updating page view:", updateError);
        return false;
      }
    } else {
      // Record doesn't exist, create new one
      const { error: insertError } = await supabase
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

      if (insertError) {
        console.error("Error inserting page view:", insertError);
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
      .maybeSingle();

    if (error) {
      console.error("Error getting page views:", error);
      return 0;
    }

    if (!data || data.count === null || data.count === undefined) {
      return 0;
    }

    return data.count as number;
  } catch (error) {
    console.error("Error getting page views:", error);
    return 0;
  }
};
