const { getDb } = require("./backend/db/database");
const db = getDb();
try {
  const jobsInfo = db.prepare("PRAGMA table_info(jobs)").all();
  console.log("Jobs table info:", JSON.stringify(jobsInfo, null, 2));
} catch (err) {
  console.error("Error checking table info:", err);
}
process.exit(0);
