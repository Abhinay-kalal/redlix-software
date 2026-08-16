import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { sprintCode, email, deviceId, snapshot } = await req.json();

    if (!sprintCode || !email) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // First find the sprint by code
    const sprint = await prisma.hackathon.findUnique({
      where: { joinCode: sprintCode }
    });

    if (!sprint) {
      return NextResponse.json({ success: false, error: "Sprint not found" }, { status: 404 });
    }

    // Find the participant
    const participant = await prisma.sprintParticipant.findFirst({
      where: { sprintId: sprint.id, email: email.trim().toLowerCase() }
    });

    if (!participant) {
      return NextResponse.json({ success: false, error: "Participant not found" }, { status: 404 });
    }

    // 1-Device Check Logic
    if (deviceId) {
      if (participant.deviceId && participant.deviceId !== deviceId) {
        // Mismatching device ID!
        return NextResponse.json({ 
          success: false, 
          error: "1-DEVICE-VIOLATION",
          message: "You are already logged in from another device." 
        }, { status: 403 });
      }
    }

    // Update the participant
    const updateData: any = {};
    if (deviceId && !participant.deviceId) {
      updateData.deviceId = deviceId;
    }
    if (snapshot) {
      updateData.latestSnapshot = snapshot;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.sprintParticipant.update({
        where: { id: participant.id },
        data: updateData
      });
    }

    return NextResponse.json({ success: true, isLocked: participant.isLocked, warningsCount: participant.warningsCount });
  } catch (error: any) {
    console.error("POST /api/sprints/participants/sync error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
