import { NextResponse } from "next/server";
import { wrapCodeForPiston } from "@/lib/code-wrappers";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: Request) {
  try {
    const { language, code, testCases } = await req.json();

    if (!language || !code || !testCases) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const wrappedCode = wrapCodeForPiston(language, code, testCases);
    
    const fileId = Math.random().toString(36).substring(7);
    let ext = "txt";
    let cmd = "";
    
    if (language === "python") { ext = "py"; cmd = "python"; }
    else if (language === "javascript" || language === "typescript") { ext = "js"; cmd = "node"; }
    else if (language === "java") { ext = "java"; cmd = "java"; }
    else if (language === "cpp") { ext = "cpp"; cmd = "cpp"; }
    else if (language === "sql") { ext = "py"; cmd = "python"; }

    const tmpFile = path.join(os.tmpdir(), "exec_" + fileId + "." + ext);
    fs.writeFileSync(tmpFile, wrappedCode);

    return new Promise((resolve) => {
      // Execute local process with 5 second timeout
      exec(cmd + ' "' + tmpFile + '"', { timeout: 5000 }, (error, stdout, stderr) => {
        try { fs.unlinkSync(tmpFile); } catch (e) {}

        if (error && error.killed) {
           return resolve(NextResponse.json({
            success: true,
            data: [{ caseIndex: 1, status: "fail", error: "Time Limit Exceeded (Infinite Loop or Code Too Slow)" }]
          }));
        }

        const out = stdout ? stdout.trim() : "";
        
        try {
          const parsed = JSON.parse(out);
          resolve(NextResponse.json({ success: true, data: parsed }));
        } catch (e) {
          const fallback = stderr ? stderr : out;
          resolve(NextResponse.json({
            success: true,
            data: [{ caseIndex: 1, status: "fail", error: "Execution Error:\\n" + fallback }]
          }));
        }
      });
    });

  } catch (error: any) {
    console.error("Execute API Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
