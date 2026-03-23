const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkKyc() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'kyc_documents'
    `);
    console.log('KYC Documents Table Columns:');
    res.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
    // Check if user has kyc_status
    const userCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'kyc_status'
    `);
    console.log('User KYC Status Column:', userCols.rows.length > 0 ? 'exists' : 'MISSING');
    
    // Check constraints if any
    const constraints = await pool.query(`
        SELECT conname, pg_get_constraintdef(c.oid)
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE contype = 'f' AND conrelid = 'kyc_documents'::regclass;
    `);
    console.log('Foreign keys on kyc_documents:', constraints.rows);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkKyc();
