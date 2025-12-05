import { NextRequest, NextResponse } from "next/server";
import { getCurrentMonthViews } from "~~/lib/pageViews";

// GET - Get current month's view count
export async function GET() {
  try {
    const count = await getCurrentMonthViews();

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error getting page views:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong", count: 0 },
      { status: 500 }
    );
  }
}
