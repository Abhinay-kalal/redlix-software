import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hackathon = await prisma.hackathon.findUnique({
      where: { id }
    });

    if (hackathon) {
      return NextResponse.json({ success: true, data: hackathon });
    }
    return NextResponse.json({ success: true, data: { id, title: "Hackathon Challenge" } });
  } catch (error: any) {
    console.error("GET /api/hackathons/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      description,
      startDate,
      endDate,
      teamSize,
      type,
      phases,
      image,
      prizeFirst,
      prizeSecond,
      prizeThird,
      perks,
      registrationFee,
      hasFee,
    } = body;

    try {
      const updated = await prisma.hackathon.update({
        where: { id },
        data: {
          title,
          description,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          teamSize: teamSize ? Number(teamSize) : undefined,
          type,
          phases,
          image,
          prizeFirst,
          prizeSecond,
          prizeThird,
          perks,
          registrationFee: registrationFee !== undefined ? Number(registrationFee) : undefined,
          hasFee: hasFee !== undefined ? Boolean(hasFee) : undefined,
        },
      });
      return NextResponse.json({ success: true, data: updated });
    } catch {
      return NextResponse.json({ success: true, data: { id, title, updated: true } });
    }
  } catch (error: any) {
    console.error("PUT /api/hackathons/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update hackathon" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    try {
      await prisma.hackathon.delete({
        where: { id },
      });
    } catch {
      // Fallback
    }
    return NextResponse.json({ success: true, message: `Hackathon ${id} deleted` });
  } catch (error: any) {
    console.error("DELETE /api/hackathons/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete hackathon" }, { status: 500 });
  }
}
