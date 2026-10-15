import type { Db } from "../../core/db.js";

const COLUMNS = "id, username, full_name, phone, role, active, last_login_at, created_at";

export async function list(db: Db, role: string) {
  const { rows } = await db.query(
    `SELECT ${COLUMNS},
            (SELECT COUNT(*) FROM orders o WHERE o.assignee_id = u.id AND o.status IN ('confirmed','delivering')) AS open_orders
       FROM users u
      WHERE ($1 = '' OR role = $1)
      ORDER BY active DESC, role, full_name`,
    [role],
  );
  return rows;
}

export async function lock(db: Db, id: number) {
  const { rows } = await db.query(`SELECT ${COLUMNS} FROM users WHERE id = $1 FOR UPDATE`, [id]);
  return rows[0] ?? null;
}

export async function lockActiveAdmins(db: Db) {
  const { rows } = await db.query("SELECT id FROM users WHERE role = 'admin' AND active ORDER BY id FOR UPDATE");
  return rows.map((r) => r.id as number);
}

export async function insert(
  db: Db,
  u: { username: string; password_hash: string; full_name: string; phone: string | null; role: string },
) {
  const { rows } = await db.query(
    `INSERT INTO users (username, password_hash, full_name, phone, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING ${COLUMNS}`,
    [u.username, u.password_hash, u.full_name, u.phone, u.role],
  );
  return rows[0];
}

export async function update(
  db: Db,
  id: number,
  u: { full_name: string; phone: string | null; role: string; active: boolean; bump: boolean },
) {
  const { rows } = await db.query(
    `UPDATE users SET full_name = $2, phone = $3, role = $4, active = $5,
            token_version = token_version + CASE WHEN $6 THEN 1 ELSE 0 END
      WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, u.full_name, u.phone, u.role, u.active, u.bump],
  );
  return rows[0];
}

export async function setPassword(db: Db, id: number, hash: string) {
  await db.query("UPDATE users SET password_hash = $2, token_version = token_version + 1 WHERE id = $1", [id, hash]);
}
