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

async function listExams() {
  const { data, error } = await supabase.from("exams").select("*").order("id", { ascending: true });
  if (error) {
    console.error(error);
    return;
  }
  console.log("Current Exams in Database:");
  console.log(data);
}

listExams();
