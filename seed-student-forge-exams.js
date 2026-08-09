import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const studentForgeExams = [
  {
    name: "Technical Wing Examination 2026",
    date: "2026-08-10",
    time: "11:00 AM IST",
    description: `Exam Type: Technical Wing Assessment
Total Questions: 50 | Total Marks: 100 | Duration: 3 Hours (180 Minutes)
Pass Percentage: 40% | Question Type: MCQs | Negative Marking: No

Syllabus:
• Programming Fundamentals
• Web Development
• Software Development
• Backend & Database
• Cloud & Deployment
• Git & Version Control
• API & Authentication
• Debugging & Testing

General Exam Instructions:
1. Each examination consists of 50 questions (2 marks each).
2. The maximum score is 100 marks. Duration: 3 Hours (180 minutes).
3. Minimum 40 marks (40%) is required to pass.
4. No negative marking. Candidates must complete within time limit.`,
    total_qns: 50,
    types_of_qns: "Multiple Choice Questions (MCQs)",
    company_name: "STUDENT FORGE",
    company_logo: "https://ik.imagekit.io/dypkhqxip/technical%20Wing.png",
    is_started: false,
    show_login: true,
    registration_closed: false,
    custom_fields: {
      "Exam Type": "Technical Wing Assessment",
      "Total Marks": "100 Marks (2 Marks/Question)",
      "Duration": "3 Hours (180 Minutes)",
      "Pass Percentage": "40% (Minimum 40 Marks)",
      "Negative Marking": "No Negative Marking",
      "Proctoring": "Strict Real-Time Monitoring",
    },
  },
  {
    name: "Marketing Wing Examination 2026",
    date: "2026-08-10",
    time: "11:00 AM IST",
    description: `Exam Type: Marketing Wing Assessment
Total Questions: 50 | Total Marks: 100 | Duration: 3 Hours (180 Minutes)
Pass Percentage: 40% | Question Type: MCQs | Negative Marking: No

Syllabus:
• Marketing Fundamentals
• Digital Marketing
• Social Media Marketing
• Content Marketing
• Branding & Communication
• SEO & SEM
• Event Marketing
• Marketing Analytics

General Exam Instructions:
1. Each examination consists of 50 questions (2 marks each).
2. The maximum score is 100 marks. Duration: 3 Hours (180 minutes).
3. Minimum 40 marks (40%) is required to pass.
4. No negative marking. Candidates must complete within time limit.`,
    total_qns: 50,
    types_of_qns: "Multiple Choice Questions (MCQs)",
    company_name: "STUDENT FORGE",
    company_logo: "https://ik.imagekit.io/dypkhqxip/marketing%20Wing.png",
    is_started: false,
    show_login: true,
    registration_closed: false,
    custom_fields: {
      "Exam Type": "Marketing Wing Assessment",
      "Total Marks": "100 Marks (2 Marks/Question)",
      "Duration": "3 Hours (180 Minutes)",
      "Pass Percentage": "40% (Minimum 40 Marks)",
      "Negative Marking": "No Negative Marking",
      "Proctoring": "Strict Real-Time Monitoring",
    },
  },
  {
    name: "Data Analytics Wing Examination 2026",
    date: "2026-08-10",
    time: "11:00 AM IST",
    description: `Exam Type: Data Analytics Wing Assessment
Total Questions: 50 | Total Marks: 100 | Duration: 3 Hours (180 Minutes)
Pass Percentage: 40% | Question Type: MCQs | Negative Marking: No

Syllabus:
• Data Analytics Fundamentals
• Excel & Spreadsheets
• Statistics
• SQL
• Data Visualization
• Dashboard Development
• Business Analytics
• Data Interpretation

General Exam Instructions:
1. Each examination consists of 50 questions (2 marks each).
2. The maximum score is 100 marks. Duration: 3 Hours (180 minutes).
3. Minimum 40 marks (40%) is required to pass.
4. No negative marking. Candidates must complete within time limit.`,
    total_qns: 50,
    types_of_qns: "Multiple Choice Questions (MCQs)",
    company_name: "STUDENT FORGE",
    company_logo: "https://ik.imagekit.io/dypkhqxip/Data%20Analytics%20Wing.png",
    is_started: false,
    show_login: true,
    registration_closed: false,
    custom_fields: {
      "Exam Type": "Data Analytics Wing Assessment",
      "Total Marks": "100 Marks (2 Marks/Question)",
      "Duration": "3 Hours (180 Minutes)",
      "Pass Percentage": "40% (Minimum 40 Marks)",
      "Negative Marking": "No Negative Marking",
      "Proctoring": "Strict Real-Time Monitoring",
    },
  },
  {
    name: "UI & UX Wing Examination 2026",
    date: "2026-08-10",
    time: "11:00 AM IST",
    description: `Exam Type: UI & UX Wing Assessment
Total Questions: 50 | Total Marks: 100 | Duration: 3 Hours (180 Minutes)
Pass Percentage: 40% | Question Type: MCQs | Negative Marking: No

Syllabus:
• UI/UX Fundamentals
• UX Research
• User Personas & User Journey
• Information Architecture
• Wireframing
• UI Design Principles
• Typography & Color Theory
• Responsive Design
• Figma & Prototyping
• Usability Testing

General Exam Instructions:
1. Each examination consists of 50 questions (2 marks each).
2. The maximum score is 100 marks. Duration: 3 Hours (180 minutes).
3. Minimum 40 marks (40%) is required to pass.
4. No negative marking. Candidates must complete within time limit.`,
    total_qns: 50,
    types_of_qns: "Multiple Choice Questions (MCQs)",
    company_name: "STUDENT FORGE",
    company_logo: "https://ik.imagekit.io/dypkhqxip/UI%20and%20UX%20Wing.png",
    is_started: false,
    show_login: true,
    registration_closed: false,
    custom_fields: {
      "Exam Type": "UI & UX Wing Assessment",
      "Total Marks": "100 Marks (2 Marks/Question)",
      "Duration": "3 Hours (180 Minutes)",
      "Pass Percentage": "40% (Minimum 40 Marks)",
      "Negative Marking": "No Negative Marking",
      "Proctoring": "Strict Real-Time Monitoring",
    },
  },
];

async function main() {
  console.log("Updating Student Forge Wing Examinations duration to 3 Hours in Supabase...");

  for (const examData of studentForgeExams) {
    const { data: existing } = await supabase
      .from("exams")
      .select("id")
      .eq("name", examData.name)
      .maybeSingle();

    if (existing) {
      const { data: updated, error } = await supabase
        .from("exams")
        .update(examData)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) console.error("Update error:", error);
      else console.log(`[UPDATED DURATION] ${updated.name} -> Duration: 3 Hours`);
    } else {
      const { data: created, error } = await supabase
        .from("exams")
        .insert(examData)
        .select()
        .single();
      if (error) console.error("Insert error:", error);
      else console.log(`[CREATED] ${created.name} -> Duration: 3 Hours`);
    }
  }

  console.log("Successfully updated duration for all 4 exams!");
}

main().catch(console.error);
