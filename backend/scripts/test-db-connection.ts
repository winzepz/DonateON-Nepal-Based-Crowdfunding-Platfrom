import pool from "../src/db";


async function main() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT 1 AS ok");
    console.log("✅ Database connected:", result.rows[0]);
    client.release();
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  } finally {
    await pool.end();
  }
}

main();
