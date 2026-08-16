import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { teamId } = await req.json();
    if (!teamId) {
      return NextResponse.json({ success: false, error: "Team ID is required" }, { status: 400 });
    }

    // Get current candidate from cookies
    const cookieStore = await cookies();
    const candidateEmail = cookieStore.get("candidate_email")?.value;
    
    if (!candidateEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please login again." }, { status: 401 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found. Please check the ID." }, { status: 404 });
    }

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: team.hackathonId },
    });

    if (!hackathon) {
      return NextResponse.json({ success: false, error: "Associated hackathon not found." }, { status: 404 });
    }

    // Parse members
    let members = [];
    try {
      members = JSON.parse(team.members || "[]");
    } catch {
      members = [];
    }

    if (members.includes(candidateEmail)) {
      return NextResponse.json({ success: false, error: "You are already a member of this team." }, { status: 400 });
    }

    if (members.length >= hackathon.teamSize) {
      return NextResponse.json({ success: false, error: `Team is full. Max team size is ${hackathon.teamSize}.` }, { status: 400 });
    }

    // Add member
    members.push(candidateEmail);

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { members: JSON.stringify(members) },
    });

    return NextResponse.json({ success: true, data: updatedTeam });
  } catch (error: any) {
    console.error("POST /api/teams/join error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to join team" }, { status: 500 });
  }
}
