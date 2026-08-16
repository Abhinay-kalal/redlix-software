import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json({ success: false, error: "Team ID is required" }, { status: 400 });
    }

    // Verify candidate is logged in
    const cookieStore = await cookies();
    const candidateEmail = cookieStore.get("candidate_email")?.value;
    
    if (!candidateEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Fetch team from Prisma
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found." }, { status: 404 });
    }

    // Fetch hackathon separately since relation is not defined in schema
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: team.hackathonId },
      select: {
        title: true,
        image: true,
        teamSize: true
      }
    });

    if (!hackathon) {
      return NextResponse.json({ success: false, error: "Hackathon not found." }, { status: 404 });
    }

    // Parse members
    let members = [];
    try {
      members = JSON.parse(team.members || "[]");
    } catch {
      members = [];
    }

    // Fetch the candidate profiles for these members from Supabase
    const supabase = getSupabaseAdminClient();
    const { data: profiles, error } = await supabase
      .from("candidates")
      .select("id, full_name, email")
      .in("email", members);

    if (error) {
      console.error("Failed to fetch member profiles:", error);
    }

    return NextResponse.json({ 
      success: true, 
      team: { ...team, hackathon, members }, 
      profiles: profiles || [] 
    });
  } catch (error: any) {
    console.error("GET /api/teams/details error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
