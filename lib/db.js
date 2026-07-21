import { generateAccessCode } from "./access-code.js";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

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
  `);

  const bookingColumns = db.prepare("PRAGMA table_info(bookings)").all();
  if (!bookingColumns.some((column) => column.name === "entrance_code")) {
    db.exec("ALTER TABLE bookings ADD COLUMN entrance_code TEXT");
  }
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_entrance_code ON bookings(entrance_code) WHERE entrance_code IS NOT NULL");

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




