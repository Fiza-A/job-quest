const XLSX = require("xlsx"); 
 
 function parseMetaInfo(metaInfo) { 
   if (!metaInfo) return {}; 
 
   const lines = metaInfo.split("\n").map(s => s.trim()).filter(Boolean); 
   const line1 = lines[0] || ""; 
   const line2 = lines[1] || ""; 
 
   // Line 1: "Bengaluru, Karnataka, India · 16 hours ago · 44 applicants" 
   const parts1 = line1.split(" · "); 
   const meta_location = parts1[0]?.trim() || ""; 
   
   let posted_time = parts1[1]?.trim() || ""; 
   posted_time = posted_time.replace(/^Reposted\s+/i, "").trim(); 
 
   const rawApplicants = parts1[2]?.trim() || "0"; 
   let applicant_count = "0"; 
   if (rawApplicants.toLowerCase().startsWith("over 100")) { 
     applicant_count = "100+"; 
   } else { 
     const num = parseInt(rawApplicants.replace(/[^0-9]/g, ""), 10); 
     applicant_count = isNaN(num) ? "0" : String(num); 
   } 
 
   // Line 2: "Promoted by hirer · Company review time is typically 1 week" 
   const is_promoted = line2.toLowerCase().includes("promoted by hirer"); 
   let response_status = line2; 
   if (is_promoted) { 
     response_status = line2.replace(/^Promoted by hirer\s*·\s*/i, "").trim(); 
   } 
   response_status = response_status 
     .replace("No response insights available yet", "No response insights") 
     .trim(); 
 
   return { meta_location, posted_time, applicant_count, is_promoted, response_status }; 
 } 
 
 function parseJobType(jobType) { 
   if (!jobType) return { work_mode: "", employment_type: "" }; 
   const [work_mode, employment_type] = jobType.split(" | ").map(s => s.trim()); 
   return { work_mode: work_mode || "", employment_type: employment_type || "" }; 
 } 
 
 function parseExtraInfo(extraInfo) { 
   if (!extraInfo) return { is_promoted: false, is_easy_apply: false }; 
   return { 
     is_promoted: extraInfo.includes("Promoted"), 
     is_easy_apply: extraInfo.includes("Easy Apply"), 
   }; 
 } 
 
 function parseLocation(location) { 
   if (!location) return ""; 
   return location.replace(/\s*\([^)]*\)\s*$/, "").trim(); 
 } 
 
 function parseApplyLink(applyLink) { 
   if (!applyLink || applyLink === "INTERNAL") return "Easy Apply on LinkedIn"; 
   return applyLink.trim() || "Not available"; 
 } 
 
 function parseCompanyDetails(companyDetails) { 
   if (!companyDetails) return { company_industry: "", company_size: "", company_about: "" }; 
 
   const lines = companyDetails.split("\n").map(s => s.trim()).filter(Boolean); 
 
   // Find the line after "Follow" which has: "Industry X-Y employees N on LinkedIn" 
   const followIdx = lines.findIndex(l => l.toLowerCase() === "follow"); 
   const infoLine = followIdx >= 0 ? (lines[followIdx + 1] || "") : ""; 
 
   // Extract company_size: pattern like "2-10 employees" or "1001-5000 employees" or "10,001+ employees" 
   const sizeMatch = infoLine.match(/(\d[\d,]*(?:\+|[-–]\d[\d,]*)?)\s*employees/i); 
   const company_size = sizeMatch ? sizeMatch[0] : ""; 
 
   // Extract industry: everything before the size pattern 
   const company_industry = sizeMatch 
     ? infoLine.slice(0, infoLine.indexOf(sizeMatch[0])).trim() 
     : infoLine; 
 
   // Extract about: everything after the info line 
   const aboutStartIdx = followIdx >= 0 ? followIdx + 2 : 0; 
   let aboutLines = lines.slice(aboutStartIdx); 
   // Remove trailing "show more" lines 
   aboutLines = aboutLines.filter(l => 
     !["…", "show more", "Show more", "…show more"].includes(l.toLowerCase()) 
   ); 
   const company_about = aboutLines.join(" ").trim(); 
 
   return { company_industry, company_size, company_about }; 
 } 
 
 function parseExcelFile(filePath) { 
   const workbook = XLSX.readFile(filePath); 
   const sheet = workbook.Sheets[workbook.SheetNames[0]]; 
   const rows = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" }); 
 
   return rows.map((row, index) => { 
     const meta = parseMetaInfo(row["meta_info"]); 
     const jobType = parseJobType(row["job_type"]); 
     const extraInfo = parseExtraInfo(row["extra_info"]); 
     const companyInfo = parseCompanyDetails(row["company_details"]); 
 
     return { 
       // Core job info 
       job_title:        String(row["title"] || "").trim(), 
       company:          String(row["company"] || "").trim(), 
       location:         parseLocation(String(row["location"] || "")), 
       job_url:          String(row["job_link"] || "").trim(), 
 
       // Work details 
       work_mode:        jobType.work_mode, 
       employment_type:  jobType.employment_type, 
 
       // From meta_info (parsed) 
       meta_location:    meta.meta_location, 
       posted_time:      meta.posted_time, 
       applicant_count:  meta.applicant_count, 
       is_promoted:      meta.is_promoted || extraInfo.is_promoted, 
       response_status:  meta.response_status, 
 
       // Apply info 
       is_easy_apply:    extraInfo.is_easy_apply, 
       apply_type:       String(row["apply_type"] || "").trim(), 
       apply_link:       parseApplyLink(row["apply_link"]), 
 
       // Company details (parsed) 
       company_industry: companyInfo.company_industry, 
       company_size:     companyInfo.company_size, 
       company_about:    companyInfo.company_about, 
 
       // Full description (kept for AI) 
       description:      String(row["full_description"] || "").trim(), 
 
       // Internal tracking 
       row_index:        index, 
       import_errors:    [], 
     }; 
   }); 
 } 
 
 module.exports = { parseExcelFile }; 
