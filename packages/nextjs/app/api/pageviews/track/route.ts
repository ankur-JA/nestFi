import { NextRequest, NextResponse } from "next/server";
import { trackPageView } from "~~/lib/pageViews";

// POST - Track a page view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page = "landing" } = body;

    // Only track landing page for now
    if (page !== "landing") {
      return NextResponse.json({
        success: true,
        message: "Only landing page tracked",
      });
    }

    const success = await trackPageView();

    if (!success) {
      // Check if Supabase is configured
      const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      return NextResponse.json({
        success: false,
        error: hasSupabase 
          ? "Failed to track page view. Check server logs for details."
          : "Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
      }, { status: hasSupabase ? 500 : 503 });
    }

    return NextResponse.json({
      success: true,
      message: "Page view tracked successfully",
    });
  } catch (error) {
    console.error("Page view tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
