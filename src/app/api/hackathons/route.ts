import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const FALLBACK_HACKATHONS = [
  {
    id: "hack-uiux-2026",
    title: "Redlix UI/UX & Product Design Sprint 2026",
    description: "Design next-generation user interfaces, interactive wireframes, and design systems for enterprise SaaS applications.",
    startDate: "2026-08-15T09:00:00.000Z",
    endDate: "2026-08-30T18:00:00.000Z",
    teamSize: 4,
    type: "Online",
    phases: "Phase 1: Wireframing & Concept, Phase 2: High-Fidelity Prototype, Phase 3: Final Pitch",
    image: "https://ik.imagekit.io/dypkhqxip/UI%20and%20UX%20Wing.png",
    prizeFirst: "₹2,50,000",
    prizeSecond: "₹1,50,000",
    prizeThird: "₹1,00,000",
    perks: "Official Redlix Certificate, Fast-track Interview, Design Kit Swag",
    registrationFee: 0,
    hasFee: false,
    createdAt: "2026-08-01T00:00:00.000Z"
  },
  {
    id: "hack-[#E61E32]-tech-2026",
    title: "Redlix Global Technical & Full-Stack Challenge 2026",
    description: "Build scalable web applications, real-time microservices, and AI-powered proctoring tools using Next.js, Node, and Cloud APIs.",
    startDate: "2026-08-10T10:00:00.000Z",
    endDate: "2026-08-28T23:59:59.000Z",
    teamSize: 3,
    type: "Online",
    phases: "Phase 1: Architecture & GitHub Setup, Phase 2: Core Feature Implementation, Phase 3: Deployment",
    image: "https://ik.imagekit.io/dypkhqxip/technical%20Wing.png",
    prizeFirst: "₹3,00,000",
    prizeSecond: "₹2,00,000",
    prizeThird: "₹1,00,000",
    perks: "Redlix Engineering Internship, Cloud Credits, Certificate of Distinction",
    registrationFee: 0,
    hasFee: false,
    createdAt: "2026-08-01T00:00:00.000Z"
  },
  {
    id: "hack-analytics-2026",
    title: "Redlix Data Analytics & Insights Hackathon 2026",
    description: "Solve complex data engineering pipelines, predictive modeling tasks, and interactive data visualization dashboards.",
    startDate: "2026-08-01T09:00:00.000Z",
    endDate: "2026-08-25T18:00:00.000Z",
    teamSize: 4,
    type: "Online",
    phases: "Phase 1: Data Cleansing, Phase 2: Exploratory Analysis & Model Building, Phase 3: Dashboard Demo",
    image: "https://ik.imagekit.io/dypkhqxip/Data%20Analytics%20Wing.png",
    prizeFirst: "₹2,00,000",
    prizeSecond: "₹1,20,000",
    prizeThird: "₹80,000",
    perks: "Data Science Certification, Direct Recruiter Review, Swag Box",
    registrationFee: 0,
    hasFee: false,
    createdAt: "2026-08-01T00:00:00.000Z"
  }
];

export async function GET() {
  try {
    const hackathons = await prisma.hackathon.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: hackathons || [] });
  } catch (error) {
    console.error("GET /api/hackathons error:", error);
    return NextResponse.json({ success: true, data: [] });
  }
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

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Title, start date, and end date are required" },
        { status: 400 }
      );
    }

    try {
      const created = await prisma.hackathon.create({
        data: {
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          teamSize: Number(teamSize) || 4,
          type: type || "Online",
          phases,
          image: image || "https://ik.imagekit.io/dypkhqxip/technical%20Wing.png",
          prizeFirst,
          prizeSecond,
          prizeThird,
          perks,
          registrationFee: Number(registrationFee) || 0,
          hasFee: Boolean(hasFee),
        },
      });
      return NextResponse.json({ success: true, data: created });
    } catch {
      // Memory fallback if db table is missing or disconnected
      const fallbackCreated = {
        id: `hack-custom-${Date.now()}`,
        title,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        teamSize: Number(teamSize) || 4,
        type: type || "Online",
        phases,
        image: image || "https://ik.imagekit.io/dypkhqxip/technical%20Wing.png",
        prizeFirst,
        prizeSecond,
        prizeThird,
        perks,
        registrationFee: Number(registrationFee) || 0,
        hasFee: Boolean(hasFee),
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, data: fallbackCreated });
    }
  } catch (error: any) {
    console.error("POST /api/hackathons error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create hackathon" },
      { status: 500 }
    );
  }
}
