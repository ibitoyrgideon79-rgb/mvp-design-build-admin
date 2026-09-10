import { randomUUID } from "crypto";
import { Pool, types } from "pg";

// DATE columns default to JS Date objects at local midnight, which then
// shift by a day when serialized back through toISOString() unless the
// server's timezone happens to be UTC. Returning the raw "YYYY-MM-DD"
// string pg already receives from Postgres sidesteps that conversion
// entirely - there's no timezone-safe way to round-trip a plain date
// through a JS Date object.
types.setTypeParser(types.builtins.DATE, (value) => value);

// Vercel's Neon Postgres integration injects several env var names
// depending on setup (DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL...);
// accept whichever one shows up instead of requiring the project to be
// reconfigured to match one specific name.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

const pool = new Pool({ connectionString });

let schemaReady = null;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = pool.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id UUID PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL,
        department TEXT NOT NULL,
        start_date DATE NOT NULL,
        employment_type TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS staff_number SERIAL;
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS photo_url TEXT;
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE;
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS id_lost BOOLEAN NOT NULL DEFAULT FALSE;

      -- No login system beyond one shared admin credential, so there's no
      -- real user identity to attach to a change - performed_by is instead
      -- whatever name the admin typed into the "Your name" field on the
      -- Manage Staff page. staff_name is a snapshot (not a foreign key):
      -- a delete removes the staff row, and the log needs to still say
      -- whose record it was after that happens.
      CREATE TABLE IF NOT EXISTS staff_activity_log (
        id SERIAL PRIMARY KEY,
        staff_id UUID,
        staff_name TEXT NOT NULL,
        action TEXT NOT NULL,
        performed_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }
  return schemaReady;
}

function badgeId(staffNumber) {
  return `MVP-${String(staffNumber).padStart(4, "0")}`;
}

function toRecord(row) {
  return {
    id: row.id,
    badgeId: badgeId(row.staff_number),
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    department: row.department,
    startDate: row.start_date,
    employmentType: row.employment_type,
    photoUrl: row.photo_url,
    enabled: row.enabled,
    idLost: row.id_lost,
    createdAt: row.created_at.toISOString(),
  };
}

function toActivityRecord(row) {
  return {
    id: row.id,
    staffId: row.staff_id,
    staffName: row.staff_name,
    action: row.action,
    performedBy: row.performed_by,
    createdAt: row.created_at.toISOString(),
  };
}

async function logActivity(client, { staffId, staffName, action, performedBy }) {
  await client.query(
    `INSERT INTO staff_activity_log (staff_id, staff_name, action, performed_by) VALUES ($1, $2, $3, $4)`,
    [staffId, staffName, action, performedBy || null]
  );
}

export async function listStaff() {
  await ensureSchema();
  const { rows } = await pool.query("SELECT * FROM staff ORDER BY created_at DESC");
  return rows.map(toRecord);
}

export async function getStaff(id) {
  await ensureSchema();
  let rows;
  try {
    ({ rows } = await pool.query("SELECT * FROM staff WHERE id = $1", [id]));
  } catch (err) {
    // 22P02 = invalid_text_representation - `id` wasn't a valid UUID at
    // all (e.g. a bad/tampered QR link), which is a "not found", not a
    // server error.
    if (err.code === "22P02") return null;
    throw err;
  }
  return rows[0] ? toRecord(rows[0]) : null;
}

export async function onboardStaff(input) {
  await ensureSchema();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO staff (id, full_name, email, phone, role, department, start_date, employment_type, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        randomUUID(),
        input.fullName,
        input.email,
        input.phone || null,
        input.role,
        input.department,
        input.startDate,
        input.employmentType,
        input.photoUrl || null,
      ]
    );
    const record = toRecord(rows[0]);
    await logActivity(client, {
      staffId: record.id,
      staffName: record.fullName,
      action: "created",
      performedBy: input.performedBy,
    });
    await client.query("COMMIT");
    return record;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updateStaff(id, input) {
  await ensureSchema();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `UPDATE staff
       SET full_name = $2, email = $3, phone = $4, role = $5, department = $6, start_date = $7, employment_type = $8, photo_url = $9
       WHERE id = $1
       RETURNING *`,
      [
        id,
        input.fullName,
        input.email,
        input.phone || null,
        input.role,
        input.department,
        input.startDate,
        input.employmentType,
        input.photoUrl || null,
      ]
    );
    if (!rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }
    const record = toRecord(rows[0]);
    await logActivity(client, {
      staffId: record.id,
      staffName: record.fullName,
      action: "updated",
      performedBy: input.performedBy,
    });
    await client.query("COMMIT");
    return record;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function setStaffStatus(id, { enabled, idLost }, performedBy) {
  await ensureSchema();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query("SELECT * FROM staff WHERE id = $1", [id]);
    if (!existing.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }
    const before = toRecord(existing.rows[0]);
    const nextEnabled = enabled ?? before.enabled;
    const nextIdLost = idLost ?? before.idLost;

    const { rows } = await client.query(
      `UPDATE staff SET enabled = $2, id_lost = $3 WHERE id = $1 RETURNING *`,
      [id, nextEnabled, nextIdLost]
    );
    const record = toRecord(rows[0]);

    if (enabled !== undefined && enabled !== before.enabled) {
      await logActivity(client, {
        staffId: id, staffName: record.fullName,
        action: enabled ? "enabled" : "disabled", performedBy,
      });
    }
    if (idLost !== undefined && idLost !== before.idLost) {
      await logActivity(client, {
        staffId: id, staffName: record.fullName,
        action: idLost ? "marked_lost" : "marked_found", performedBy,
      });
    }

    await client.query("COMMIT");
    return record;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteStaff(id, performedBy) {
  await ensureSchema();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("DELETE FROM staff WHERE id = $1 RETURNING full_name", [id]);
    if (!rows[0]) {
      await client.query("ROLLBACK");
      return false;
    }
    await logActivity(client, {
      staffId: id, staffName: rows[0].full_name,
      action: "deleted", performedBy,
    });
    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function listActivity(limit = 30) {
  await ensureSchema();
  const { rows } = await pool.query(
    "SELECT * FROM staff_activity_log ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
  return rows.map(toActivityRecord);
}

export async function clearActivity() {
  await ensureSchema();
  await pool.query("DELETE FROM staff_activity_log");
}
