import { neon } from '@neondatabase/serverless';
import type { ClaimItem } from './claimsStorage';

// Initialize Neon SQL client using environment variable
const dbUrl = import.meta.env.VITE_NEON_DATABASE_URL || '';
const sql = neon(dbUrl);

// 1. Insert a new user into Neon DB on Sign Up
export async function registerUserInNeon(fullName: string, email: string, passwordHash: string, role: string) {
  try {
    const result = await sql`
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES (${fullName}, ${email}, ${passwordHash}, ${role})
      RETURNING id, full_name, email, role, created_at;
    `;
    return { success: true, user: result[0] };
  } catch (error: any) {
    console.error("Neon DB error:", error);
    return { success: false, error: error.message };
  }
}

// 2. Fetch user from Neon DB on Sign In
export async function findUserInNeon(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1;
    `;
    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    console.error("Neon DB error:", error);
    return null;
  }
}

// 3. Save / Upsert Claim to Neon PostgreSQL
export async function saveClaimToNeon(claim: ClaimItem) {
  if (!dbUrl) return null;
  try {
    const result = await sql`
      INSERT INTO claims (id, patient, hospital, amount, status, date, insurer, savings, type)
      VALUES (${claim.id}, ${claim.patient}, ${claim.hospital}, ${claim.amount}, ${claim.status}, ${claim.date}, ${claim.insurer}, ${claim.savings}, ${claim.type})
      ON CONFLICT (id) DO UPDATE SET
        patient = EXCLUDED.patient,
        hospital = EXCLUDED.hospital,
        amount = EXCLUDED.amount,
        status = EXCLUDED.status,
        date = EXCLUDED.date,
        insurer = EXCLUDED.insurer,
        savings = EXCLUDED.savings,
        type = EXCLUDED.type
      RETURNING *;
    `;
    return result[0];
  } catch (error: any) {
    console.error("Failed to save claim to Neon DB:", error);
    return null;
  }
}

// 4. Fetch all Claims from Neon PostgreSQL
export async function fetchClaimsFromNeon(): Promise<ClaimItem[]> {
  if (!dbUrl) return [];
  try {
    const rows = await sql`
      SELECT id, patient, hospital, amount, status, date, insurer, savings, type
      FROM claims
      ORDER BY created_at DESC;
    `;
    return rows.map((r: any) => ({
      id: r.id,
      patient: r.patient,
      hospital: r.hospital,
      amount: parseFloat(r.amount),
      status: r.status,
      date: r.date,
      insurer: r.insurer,
      savings: parseFloat(r.savings),
      type: r.type,
    }));
  } catch (error: any) {
    console.error("Failed to fetch claims from Neon DB:", error);
    return [];
  }
}
