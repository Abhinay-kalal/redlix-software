import { NextRequest, NextResponse } from "next/server";
import { 
  createResendDomain, 
  getResendDomain, 
  verifyResendDomain, 
  updateResendDomain, 
  listResendDomains, 
  removeResendDomain 
} from "@/lib/resend";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get("domainId");

    if (domainId) {
      const data = await getResendDomain(domainId);
      return NextResponse.json({ success: true, data });
    }

    const data = await listResendDomains();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, domainName, domainId, openTracking, clickTracking } = body;

    if (action === "create" || !action) {
      const targetDomain = domainName || "app.redlix.co.in";
      const result = await createResendDomain(targetDomain);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "verify" && domainId) {
      const result = await verifyResendDomain(domainId);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "update" && domainId) {
      const result = await updateResendDomain(domainId, { openTracking, clickTracking });
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "remove" && domainId) {
      const result = await removeResendDomain(domainId);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: "Invalid action or parameters" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
