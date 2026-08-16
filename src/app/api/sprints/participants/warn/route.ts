import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { sprintCode, email, reason } = await req.json();

    if (!sprintCode || !email) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const sprint = await prisma.hackathon.findUnique({
      where: { joinCode: sprintCode },
    });

    if (!sprint) {
      return NextResponse.json({ success: false, error: "Sprint not found" }, { status: 404 });
    }

    const participant = await prisma.sprintParticipant.findFirst({
      where: { sprintId: sprint.id, email },
    });

    if (!participant) {
      return NextResponse.json({ success: false, error: "Participant not found" }, { status: 404 });
    }

    const newWarnings = (participant.warningsCount || 0) + 1;
    const shouldLock = newWarnings >= 3;

    // Log this to the cheatingLogs field (append JSON string)
    let existingLogs: any[] = [];
    try {
      if ((participant as any).cheatingLogs) {
        existingLogs = JSON.parse((participant as any).cheatingLogs);
      }
    } catch {}

    const newLog = {
      time: new Date().toISOString(),
      reason: reason || "Tab switch / window blur / camera absence",
      strike: newWarnings
    };

    const updatedLogs = JSON.stringify([...existingLogs, newLog]);

    const updated = await prisma.sprintParticipant.update({
      where: { id: participant.id },
      data: {
        warningsCount: newWarnings,
        isLocked: shouldLock,
        cheatingLogs: updatedLogs,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Warn endpoint error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
