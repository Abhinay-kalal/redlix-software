import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function removePreviousExams() {
  console.log("Removing previous dummy exam (ID: 1 - Redlix Full-Stack Technical Evaluation 2026)...");
  
  // Delete registrations linked to exam_id 1
  const { error: regErr } = await supabase.from("registrations").delete().eq("exam_id", 1);
  if (regErr) console.error("Error clearing previous registrations:", regErr);

  // Delete exam 1
  const { error: examErr } = await supabase.from("exams").delete().eq("id", 1);
  if (examErr) {
    console.error("Error deleting exam ID 1:", examErr);
  } else {
    console.log("Successfully removed previous dummy exam ID 1!");
  }

  const { data: remaining } = await supabase.from("exams").select("id, name, company_name").order("id", { ascending: true });
  console.log("Remaining Active Exams in Database:");
  console.table(remaining);
}

removePreviousExams();
