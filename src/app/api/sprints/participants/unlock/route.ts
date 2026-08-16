import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { participantId } = await req.json();

    if (!participantId) {
      return NextResponse.json({ success: false, error: "Missing participantId" }, { status: 400 });
    }

    const updated = await prisma.sprintParticipant.update({
      where: { id: participantId },
      data: {
        warningsCount: 0, // Reset warnings when unlocked
        isLocked: false,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Unlock endpoint error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
