const { getDb } = require("./backend/db/database");
const db = getDb();

try {
  const users = db.prepare("SELECT email, role FROM users").all();
  console.log("Current users in database:");
  console.log(JSON.stringify(users, null, 2));
} catch (err) {
  console.error("Failed to list users:", err.message);
}
process.exit(0);
