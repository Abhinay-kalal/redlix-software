import re

with open('/Users/rishirohankalapala/proctroing/web/src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# 1. Replace the entire sidebar block
sidebar_pattern = r'<nav className="flex-1 px-4 py-6 space-y-1">.*?</nav>'
sidebar_replacement = """<nav className="flex-1 px-4 py-6 space-y-1">

          <button 
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "overview" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <span className="material-symbols-outlined text-sm text-zinc-500 shrink-0">dashboard</span>
            Overview
          </button>

          <button 
            onClick={() => setActiveTab("create-exam")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "create-exam" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <span className="material-symbols-outlined text-sm text-zinc-500 shrink-0">add_circle</span>
            Create Exam
          </button>

          <button 
            onClick={() => setActiveTab("exams-list")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "exams-list" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <span className="material-symbols-outlined text-sm text-zinc-500 shrink-0">folder</span>
            Exams Directory
          </button>

          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "settings" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <span className="material-symbols-outlined text-sm text-zinc-500 shrink-0">settings</span>
            Settings
          </button>
        </nav>"""

content, count = re.subn(sidebar_pattern, sidebar_replacement, content, flags=re.DOTALL)
print(f"Replaced sidebar: {count} matches")

# 2. Replace Sign Out SVG
sign_out_pattern = r'<svg className="w-3\.5 h-3\.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">.*?</svg>'
sign_out_replacement = '<span className="material-symbols-outlined text-xs text-zinc-500 shrink-0">logout</span>'
content, count = re.subn(sign_out_pattern, sign_out_replacement, content, flags=re.DOTALL)
print(f"Replaced Sign Out SVG: {count} matches")

# 3. Replace Stats Cards SVGs
# Card 1 Exams card SVG:
card_exams_pattern = r'<div className="p-1\.5 bg-orange-50 text-orange-600 border border-orange-100">\s*<svg.*?</svg>\s*</div>'
card_exams_replacement = '<div className="p-1 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0"><span className="material-symbols-outlined text-md">folder</span></div>'
content, count = re.subn(card_exams_pattern, card_exams_replacement, content, flags=re.DOTALL)
print(f"Replaced Exams Card SVG: {count} matches")

# Card 2 Registrations card SVG:
card_regs_pattern = r'<div className="p-1\.5 bg-orange-50 text-orange-600 border border-orange-100">\s*<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">\s*<path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{2\} d="M12 4\.354a4 4 0 110 5\.292.*?</svg>\s*</div>'
card_regs_replacement = '<div className="p-1 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0"><span className="material-symbols-outlined text-md">group</span></div>'
content, count = re.subn(card_regs_pattern, card_regs_replacement, content, flags=re.DOTALL)
print(f"Replaced Registrations Card SVG: {count} matches")

# Card 4 Avg Integrity card SVG:
card_integrity_pattern = r'<div className="p-1\.5 bg-orange-50 text-orange-600 border border-orange-100">\s*<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">\s*<path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{2\} d="M9 12l2 2 4-4m5\.618-4\.016.*?</svg>\s*</div>'
card_integrity_replacement = '<div className="p-1 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0"><span className="material-symbols-outlined text-md">verified_user</span></div>'
content, count = re.subn(card_integrity_pattern, card_integrity_replacement, content, flags=re.DOTALL)
print(f"Replaced Integrity Card SVG: {count} matches")

# 4. Replace Upload Logo SVG
logo_upload_pattern = r'<svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">\s*<path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{1\.5\} d="M4 16l4\.586-4\.586a2 2 0 012\.828 0L16 16m-2-2l1\.586-1\.586a2 2 0 012\.828 0L20 14m-6-6h\.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />\s*</svg>'
logo_upload_replacement = '<span className="material-symbols-outlined text-zinc-400">image</span>'
content, count = re.subn(logo_upload_pattern, logo_upload_replacement, content, flags=re.DOTALL)
print(f"Replaced Upload Logo SVG: {count} matches")

# 5. Replace Exams Back Button SVG
back_btn_pattern = r'<button\s*onClick=\{\(\) => setSelectedExamForCandidates\(null\)\}\s*className="flex items-center justify-center p-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 cursor-pointer shadow-sm"\s*>\s*<svg.*?</svg>\s*</button>'
back_btn_replacement = '<button onClick={() => setSelectedExamForCandidates(null)} className="flex items-center justify-center p-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 cursor-pointer shadow-sm"><span className="material-symbols-outlined text-sm leading-none">arrow_back</span></button>'
content, count = re.subn(back_btn_pattern, back_btn_replacement, content, flags=re.DOTALL)
print(f"Replaced Back Button SVG: {count} matches")

# 5.5 Replace specific card icons (group and verified_user)
content = content.replace(
    '/* Card 2: Candidate Registrations */\\n              <div className=\"bg-white p-5 border border-zinc-200 shadow-sm relative overflow-hidden\">\\n                <div className=\"flex justify-between items-start mb-2\">\\n                  <span className=\"text-[10px] font-bold normal-case text-zinc-500\">Registrations</span>\\n                  <div className=\"p-1 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0\"><span className=\"material-symbols-outlined text-md\">folder</span></div>',
    '/* Card 2: Candidate Registrations */\\n              <div className=\"bg-white p-5 border border-zinc-200 shadow-sm relative overflow-hidden\">\\n                <div className=\"flex justify-between items-start mb-2\">\\n                  <span className=\"text-[10px] font-bold normal-case text-zinc-500\">Registrations</span>\\n                  <div className=\"p-1 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0\"><span className=\"material-symbols-outlined text-md\">group</span></div>'
)
content = content.replace(
    '/* Card 4: System Average Integrity */\\n              <div className=\"bg-white p-5 border border-zinc-200 shadow-sm relative overflow-hidden\">\\n                <div className=\"flex justify-between items-start mb-2\">\\n                  <span className=\"text-[10px] font-bold normal-case text-zinc-500\">Avg Integrity</span>\\n                  <div className=\"p-1 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0\"><span className=\"material-symbols-outlined text-md\">folder</span></div>',
    '/* Card 4: System Average Integrity */\\n              <div className=\"bg-white p-5 border border-zinc-200 shadow-sm relative overflow-hidden\">\\n                <div className=\"flex justify-between items-start mb-2\">\\n                  <span className=\"text-[10px] font-bold normal-case text-zinc-500\">Avg Integrity</span>\\n                  <div className=\"p-1 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0\"><span className=\"material-symbols-outlined text-md\">verified_user</span></div>'
)

# 6. Replace Candidate fallback avatar SVG
avatar_pattern = r'<div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-400">\s*<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">\s*<path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{2\} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />\s*</svg>\s*</div>'
avatar_replacement = '<div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-400"><span className="material-symbols-outlined text-xl text-zinc-400">person</span></div>'
content, count = re.subn(avatar_pattern, avatar_replacement, content, flags=re.DOTALL)
print(f"Replaced Candidate fallback avatar SVG: {count} matches")

# 7. Replace Live modal close SVG
modal_close_pattern = r'<button\s*onClick=\{\(\) => setActiveStreamSession\(null\)\}\s*className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"\s*>\s*<svg.*?</svg>\s*</button>'
modal_close_replacement = '<button onClick={() => setActiveStreamSession(null)} className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"><span className="material-symbols-outlined text-md">close</span></button>'
content, count = re.subn(modal_close_pattern, modal_close_replacement, content, flags=re.DOTALL)
print(f"Replaced Modal Close SVG: {count} matches")

# 8. Clean all uppercase styling
content = content.replace(" uppercase ", " normal-case ")
content = content.replace(" uppercase\"", " normal-case\"")
content = content.replace(" uppercase`", " normal-case`")
content = content.replace(" tracking-wide ", " ")
content = content.replace(" tracking-wide\"", "\"")
content = content.replace(" tracking-wide`", "`")
content = content.replace(" tracking-wider ", " ")
content = content.replace(" tracking-wider\"", "\"")
content = content.replace(" tracking-wider`", "`")
content = content.replace(" tracking-widest ", " ")
content = content.replace(" tracking-widest\"", "\"")
content = content.replace(" tracking-widest`", "`")

with open('/Users/rishirohankalapala/proctroing/web/src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)

print("All replacements completed successfully!")
