import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Generate a random unique 6-digit room join code
async function generateUniqueJoinCode(): Promise<string> {
  let attempts = 0;
  while (attempts < 100) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await prisma.hackathon.findUnique({
      where: { joinCode: code },
    });
    if (!existing) return code;
    attempts++;
  }
  return `SP-${Date.now()}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      startDate,
      endDate,
      teamSize,
      logoUrl,
      location,
      questions,
      type,
      parentHackathonId
    } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Title, start date, and end date are required" },
        { status: 400 }
      );
    }

    const joinCode = await generateUniqueJoinCode();

    const sprint = await prisma.hackathon.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        teamSize: Number(teamSize) || 1,
        type: type || "Online",
        logoUrl,
        location,
        questions: typeof questions === "string" ? questions : JSON.stringify(questions),
        joinCode,
        isStarted: false,
        parentHackathonId: parentHackathonId || null,
      },
    });

    return NextResponse.json({ success: true, data: sprint });
  } catch (error: any) {
    console.error("POST /api/sprints error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create sprint" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sprints = await prisma.hackathon.findMany({
      where: {
        joinCode: { not: null }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, data: sprints || [] });
  } catch (error: any) {
    console.error("GET /api/sprints error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
