import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sprintCode, email, answers, score } = body;

    if (!sprintCode || !email) {
      return NextResponse.json({ success: false, error: "Missing sprintCode or email" }, { status: 400 });
    }

    const sprint = await prisma.hackathon.findUnique({
      where: { joinCode: sprintCode }
    });

    if (!sprint) {
      return NextResponse.json({ success: false, error: "Sprint not found" }, { status: 404 });
    }

    const participant = await prisma.sprintParticipant.findFirst({
      where: { sprintId: sprint.id, email: email.trim().toLowerCase() }
    });

    if (!participant) {
      return NextResponse.json({ success: false, error: "Participant not found" }, { status: 404 });
    }

    const updated = await prisma.sprintParticipant.update({
      where: { id: participant.id },
      data: {
        answers: typeof answers === "string" ? answers : JSON.stringify(answers || {}),
        score: score || 0
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("POST /api/sprints/participants/submit error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
