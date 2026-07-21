import { generateAccessCode } from "./access-code.js";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { createHash, randomBytes, randomInt } from "node:crypto";
import path from "node:path";
import { calculateRefundQuote } from "./refund.js";

const databasePath = process.env.SOS_DB_PATH || path.join(process.cwd(), "data", "sos.db");
let instance;

function initialize(db) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('private', 'multi_a', 'multi_b')),
      capacity INTEGER NOT NULL CHECK(capacity > 0),
      sort_order INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0, 1))
    ) STRICT;

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL REFERENCES rooms(id),
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      booking_unit TEXT NOT NULL CHECK(booking_unit IN ('hour', 'day', 'week', 'month')),
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      amount INTEGER NOT NULL CHECK(amount >= 0),
      status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled')),
      cancelled_at TEXT,
      refund_rate INTEGER CHECK(refund_rate BETWEEN 0 AND 100),
      refund_amount INTEGER CHECK(refund_amount >= 0),
      entrance_code TEXT NOT NULL UNIQUE CHECK(length(entrance_code) = 6),
      access_code TEXT NOT NULL UNIQUE CHECK(length(access_code) = 6),
      sms_status TEXT NOT NULL DEFAULT 'pending' CHECK(sms_status IN ('pending', 'mocked', 'sent', 'failed')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK(start_at < end_at)
    ) STRICT;

    CREATE INDEX IF NOT EXISTS idx_bookings_room_time
      ON bookings(room_id, start_at, end_at) WHERE status = 'confirmed';

    CREATE TRIGGER IF NOT EXISTS prevent_booking_overlap_insert
    BEFORE INSERT ON bookings
    WHEN NEW.status = 'confirmed'
    BEGIN
      SELECT RAISE(ABORT, 'BOOKING_CONFLICT')
      WHERE EXISTS (
        SELECT 1 FROM bookings
        WHERE room_id = NEW.room_id
          AND status = 'confirmed'
          AND NEW.start_at < end_at
          AND NEW.end_at > start_at
      );
    END;

    CREATE TRIGGER IF NOT EXISTS prevent_booking_overlap_update
    BEFORE UPDATE OF room_id, start_at, end_at, status ON bookings
    WHEN NEW.status = 'confirmed'
    BEGIN
      SELECT RAISE(ABORT, 'BOOKING_CONFLICT')
      WHERE EXISTS (
        SELECT 1 FROM bookings
        WHERE room_id = NEW.room_id
          AND id <> NEW.id
          AND status = 'confirmed'
          AND NEW.start_at < end_at
          AND NEW.end_at > start_at
      );
    END;

    CREATE TABLE IF NOT EXISTS booking_lookup_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      verified_at TEXT,
      created_at TEXT NOT NULL
    ) STRICT;

    CREATE INDEX IF NOT EXISTS idx_lookup_codes_phone
      ON booking_lookup_codes(phone, created_at);

    CREATE TABLE IF NOT EXISTS booking_lookup_sessions (
      token_hash TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    ) STRICT;  `);

  const bookingColumns = db.prepare("PRAGMA table_info(bookings)").all();
  if (!bookingColumns.some((column) => column.name === "entrance_code")) {
    db.exec("ALTER TABLE bookings ADD COLUMN entrance_code TEXT");
  }
  if (!bookingColumns.some((column) => column.name === "cancelled_at")) {
    db.exec("ALTER TABLE bookings ADD COLUMN cancelled_at TEXT");
  }
  if (!bookingColumns.some((column) => column.name === "refund_rate")) {
    db.exec("ALTER TABLE bookings ADD COLUMN refund_rate INTEGER");
  }
  if (!bookingColumns.some((column) => column.name === "refund_amount")) {
    db.exec("ALTER TABLE bookings ADD COLUMN refund_amount INTEGER");
  }
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_entrance_code ON bookings(entrance_code) WHERE entrance_code IS NOT NULL");
  db.exec("CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(phone, customer_name, start_at)");

  const insert = db.prepare(`
    INSERT OR IGNORE INTO rooms (id, slug, name, category, capacity, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (let number = 1; number <= 10; number += 1) {
    insert.run(number, `private-${number}`, `1인실 ${number}번 부스`, "private", 1, number);
  }
  insert.run(11, "multi-a", "멀티룸 A", "multi_a", 4, 11);
  insert.run(12, "multi-b", "멀티룸 B", "multi_b", 6, 12);
}

export function getDb() {
  if (!instance) {
    mkdirSync(path.dirname(databasePath), { recursive: true });
    instance = new DatabaseSync(databasePath);
    initialize(instance);
  }
  return instance;
}

export function listRooms() {
  return getDb().prepare("SELECT * FROM rooms WHERE active = 1 ORDER BY sort_order").all();
}

export function getRoom(roomId) {
  return getDb().prepare("SELECT * FROM rooms WHERE id = ? AND active = 1").get(roomId);
}

export function createBooking(input) {
  const db = getDb();
  const room = db.prepare("SELECT * FROM rooms WHERE id = ? AND active = 1").get(input.roomId);
  if (!room) throw new Error("ROOM_NOT_FOUND");

  db.exec("BEGIN IMMEDIATE");
  try {
    const nextUniqueCode = () => {
      let code;
      do {
        code = generateAccessCode();
      } while (db.prepare("SELECT 1 FROM bookings WHERE access_code = ? OR entrance_code = ?").get(code, code));
      return code;
    };
    const entranceCode = nextUniqueCode();
    let roomAccessCode = nextUniqueCode();
    while (roomAccessCode === entranceCode) roomAccessCode = nextUniqueCode();

    const result = db.prepare(`
      INSERT INTO bookings
        (room_id, customer_name, phone, start_at, end_at, booking_unit, quantity, amount, entrance_code, access_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.roomId,
      input.customerName,
      input.phone,
      input.startAt,
      input.endAt,
      input.unit,
      input.quantity,
      input.amount,
      entranceCode,
      roomAccessCode,
    );
    const booking = db.prepare(`
      SELECT b.*, r.name AS room_name, r.category
      FROM bookings b JOIN rooms r ON r.id = b.room_id WHERE b.id = ?
    `).get(result.lastInsertRowid);
    db.exec("COMMIT");
    return booking;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function updateSmsStatus(id, status) {
  getDb().prepare("UPDATE bookings SET sms_status = ? WHERE id = ?").run(status, id);
}
export function findBookings({ customerName, phone }) {
  return getDb().prepare(`
    SELECT b.*, r.name AS room_name, r.category
    FROM bookings b
    JOIN rooms r ON r.id = b.room_id
    WHERE b.customer_name = ? AND b.phone = ?
    ORDER BY b.start_at DESC, b.id DESC
  `).all(customerName.trim(), phone.replace(/\D/g, ""));
}

export function cancelBooking({ id, customerName, phone, now = new Date() }) {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const booking = db.prepare(`
      SELECT b.*, r.name AS room_name, r.category
      FROM bookings b
      JOIN rooms r ON r.id = b.room_id
      WHERE b.id = ? AND b.customer_name = ? AND b.phone = ?
    `).get(id, customerName.trim(), phone.replace(/\D/g, ""));
    if (!booking) throw new Error("BOOKING_NOT_FOUND");
    const refund = calculateRefundQuote(booking, now);
    if (booking.status === "cancelled") {
      db.exec("COMMIT");
      return { booking, refund };
    }
    if (!refund.canCancel) throw new Error("CANCELLATION_CLOSED");
    const cancelledAt = new Date(now).toISOString();
    db.prepare(`
      UPDATE bookings
      SET status = 'cancelled', cancelled_at = ?, refund_rate = ?, refund_amount = ?
      WHERE id = ? AND status = 'confirmed'
    `).run(cancelledAt, refund.rate, refund.amount, id);
    const cancelled = db.prepare(`
      SELECT b.*, r.name AS room_name, r.category
      FROM bookings b JOIN rooms r ON r.id = b.room_id WHERE b.id = ?
    `).get(id);
    db.exec("COMMIT");
    return { booking: cancelled, refund: calculateRefundQuote(cancelled, now) };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
function lookupHash(value) {
  const secret = process.env.LOOKUP_SECRET || process.env.SOLAPI_API_SECRET || "project-sos-local-only";
  return createHash("sha256").update(`${value}:${secret}`).digest("hex");
}

export function createLookupChallenge({ customerName, phone, now = new Date() }) {
  const db = getDb();
  const cleanPhone = phone.replace(/\D/g, "");
  const cleanName = customerName.trim();
  const exists = db.prepare("SELECT 1 FROM bookings WHERE customer_name = ? AND phone = ? LIMIT 1").get(cleanName, cleanPhone);
  if (!exists) return { exists: false };
  const nowDate = new Date(now);
  const windowStart = new Date(nowDate.getTime() - 10 * 60 * 1000).toISOString();
  const recent = db.prepare("SELECT COUNT(*) AS count FROM booking_lookup_codes WHERE phone = ? AND created_at >= ?").get(cleanPhone, windowStart);
  if (Number(recent.count) >= 3) throw new Error("TOO_MANY_REQUESTS");
  const code = String(randomInt(100000, 1000000));
  const expiresAt = new Date(nowDate.getTime() + 5 * 60 * 1000).toISOString();
  db.prepare(`
    INSERT INTO booking_lookup_codes (customer_name, phone, code_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(cleanName, cleanPhone, lookupHash(`${cleanPhone}:${code}`), expiresAt, nowDate.toISOString());
  return { exists: true, code, expiresAt };
}

export function verifyLookupChallenge({ customerName, phone, code, now = new Date() }) {
  const db = getDb();
  const cleanPhone = phone.replace(/\D/g, "");
  const cleanName = customerName.trim();
  const nowDate = new Date(now);
  db.exec("BEGIN IMMEDIATE");
  try {
    const challenge = db.prepare(`
      SELECT * FROM booking_lookup_codes
      WHERE customer_name = ? AND phone = ? AND verified_at IS NULL
      ORDER BY id DESC LIMIT 1
    `).get(cleanName, cleanPhone);
    if (!challenge || challenge.expires_at <= nowDate.toISOString() || challenge.attempts >= 5) throw new Error("INVALID_OR_EXPIRED_CODE");
    const expected = lookupHash(`${cleanPhone}:${code}`);
    if (expected !== challenge.code_hash) {
      db.prepare("UPDATE booking_lookup_codes SET attempts = attempts + 1 WHERE id = ?").run(challenge.id);
      db.exec("COMMIT");
      const invalid = new Error("INVALID_OR_EXPIRED_CODE");
      invalid.transactionClosed = true;
      throw invalid;
    }
    db.prepare("UPDATE booking_lookup_codes SET verified_at = ? WHERE id = ?").run(nowDate.toISOString(), challenge.id);
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(nowDate.getTime() + 30 * 60 * 1000).toISOString();
    db.prepare(`
      INSERT INTO booking_lookup_sessions (token_hash, customer_name, phone, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(lookupHash(token), cleanName, cleanPhone, expiresAt, nowDate.toISOString());
    db.exec("COMMIT");
    return { token, expiresAt };
  } catch (error) {
    if (!error.transactionClosed) db.exec("ROLLBACK");
    throw error;
  }
}

export function getLookupSession(token, now = new Date()) {
  if (!token) return null;
  return getDb().prepare(`
    SELECT customer_name, phone, expires_at FROM booking_lookup_sessions
    WHERE token_hash = ? AND expires_at > ?
  `).get(lookupHash(token), new Date(now).toISOString()) || null;
}
