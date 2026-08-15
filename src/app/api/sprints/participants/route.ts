import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sprintId, name, email } = body;

    if (!sprintId || !name || !email) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Check if already registered
    const existing = await prisma.sprintParticipant.findFirst({
      where: { sprintId, email: email.trim().toLowerCase() }
    });

    if (existing) {
      return NextResponse.json({ success: true, data: existing });
    }

    const participant = await prisma.sprintParticipant.create({
      data: {
        sprintId,
        name,
        email: email.trim().toLowerCase()
      }
    });

    return NextResponse.json({ success: true, data: participant });
  } catch (error: any) {
    console.error("POST /api/sprints/participants error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sprintId = searchParams.get("sprintId");
    const code = searchParams.get("code");

    let finalSprintId = sprintId;

    if (code) {
      const sprint = await prisma.hackathon.findUnique({
        where: { joinCode: code }
      });
      if (!sprint) {
        return NextResponse.json({ success: false, error: "Sprint room not found" }, { status: 404 });
      }
      finalSprintId = sprint.id;
    }

    if (!finalSprintId) {
      return NextResponse.json({ success: false, error: "Missing sprint identifier" }, { status: 400 });
    }

    const participants = await prisma.sprintParticipant.findMany({
      where: { sprintId: finalSprintId },
      orderBy: { joinedAt: "asc" }
    });

    return NextResponse.json({ success: true, data: participants || [] });
  } catch (error: any) {
    console.error("GET /api/sprints/participants error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
