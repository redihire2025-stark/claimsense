import { neon } from '@neondatabase/serverless';

const dbUrl = "postgresql://neondb_owner:npg_NAWM3gF5HIUQ@ep-rapid-water-azw0h8ny.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(dbUrl);

async function initClaimsTable() {
  console.log("Connecting to Neon PostgreSQL...");
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS claims (
        id VARCHAR(100) PRIMARY KEY,
        patient VARCHAR(255) NOT NULL,
        hospital VARCHAR(255) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        date VARCHAR(100) NOT NULL,
        insurer VARCHAR(100) NOT NULL,
        savings NUMERIC(12, 2) NOT NULL,
        type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Claims table created or verified successfully in Neon DB!");

    const rows = await sql`SELECT COUNT(*) FROM claims;`;
    console.log("Current claims count in Neon DB:", rows[0].count);
  } catch (err) {
    console.error("Error creating claims table:", err);
  }
}

initClaimsTable();
