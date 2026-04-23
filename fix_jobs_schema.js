const { getDb } = require("./backend/db/database");
const db = getDb();

try {
  const columns = db.prepare("PRAGMA table_info(jobs)").all().map(c => c.name);
  
  const missingColumns = [
    ["meta_location", "TEXT"],
    ["work_mode", "TEXT"],
    ["employment_type", "TEXT"],
    ["posted_time", "TEXT"],
    ["applicant_count", "TEXT"],
    ["is_promoted", "INTEGER DEFAULT 0"],
    ["is_easy_apply", "INTEGER DEFAULT 1"],
    ["response_status", "TEXT"],
    ["apply_type", "TEXT"],
    ["apply_link", "TEXT"],
    ["job_url", "TEXT"],
    ["school", "TEXT"]
  ];

  for (const [name, type] of missingColumns) {
    if (!columns.includes(name)) {
      console.log(`Adding ${name} to jobs...`);
      db.prepare(`ALTER TABLE jobs ADD COLUMN ${name} ${type}`).run();
    }
  }

  console.log("✅ Jobs table schema update complete");
} catch (err) {
  console.error("❌ Jobs table schema update failed:", err.message);
}
process.exit(0);
