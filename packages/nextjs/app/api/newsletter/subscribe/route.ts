import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~~/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Fallback: just return success (for development without Supabase)
      console.log("Newsletter subscription (Supabase not configured):", email);
      return NextResponse.json({
        success: true,
        message: "Thanks for subscribing!",
      });
    }

    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (existingSubscriber) {
      return NextResponse.json(
        { success: false, error: "You're already subscribed!" },
        { status: 409 }
      );
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert([
        {
          email: email.toLowerCase(),
          subscribed_at: new Date().toISOString(),
          source: "website_footer",
        },
      ]);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thanks for subscribing! We'll keep you updated on NestFi news.",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscription status (optional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Email is required" },
      { status: 400 }
    );
  }

  try {
    const { data: subscriber } = await supabase
      .from("newsletter_subscribers")
      .select("email, subscribed_at")
      .eq("email", email.toLowerCase())
      .single();

    return NextResponse.json({
      success: true,
      subscribed: !!subscriber,
      data: subscriber,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      subscribed: false,
    });
  }
}
