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

    return NextResponse.json({
      success,
      message: success ? "Page view tracked" : "Failed to track",
    });
  } catch (error) {
    console.error("Page view tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
