import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";

const supabase = getSupabaseAdminClient();

export async function POST(req: NextRequest) {
  try {
    const { sessionId, image } = await req.json();

    if (!sessionId || !image) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: sessionId and image" },
        { status: 400 }
      );
    }

    // Convert base64 data URL to a binary buffer
    const matches = image.match(/^data:(image\/[a-z]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { success: false, error: "Invalid image format, expected data:image/...;base64,..." },
        { status: 400 }
      );
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Upload to Supabase Storage bucket 'live-feeds'
    const fileName = `${sessionId}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("live-feeds")
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("live-feeds")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) {
      return NextResponse.json(
        { success: false, error: "Failed to generate public URL for storage item" },
        { status: 500 }
      );
    }

    // Update the session in the database
    const { error: dbError } = await supabase
      .from("sessions")
      .update({ live_feed: publicUrl })
      .eq("id", sessionId);

    if (dbError) {
      console.error("Database update error:", dbError);
      return NextResponse.json(
        { success: false, error: `Database update failed: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error("Error in upload-feed endpoint:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
