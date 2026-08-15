import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sprint = await prisma.hackathon.findUnique({
      where: { id }
    });

    if (!sprint) {
      return NextResponse.json({ success: false, error: "Sprint not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: sprint });
  } catch (error: any) {
    console.error("GET /api/sprints/[id] error:", error);
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
    const { isStarted, title, description, questions } = body;

    const updateData: any = {};
    if (isStarted !== undefined) updateData.isStarted = Boolean(isStarted);
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (questions !== undefined) updateData.questions = typeof questions === "string" ? questions : JSON.stringify(questions);

    const updated = await prisma.hackathon.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/sprints/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
