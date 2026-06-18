const path = require("path");
const Database = require("better-sqlite3");

class SchedulerDatabase {
  constructor(baseDir) {
    const dbPath = path.join(baseDir, "shift-scheduler.db");
    this.dbPath = dbPath;
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    this.selectStatement = this.db.prepare("SELECT payload FROM app_state WHERE id = 1");
    this.upsertStatement = this.db.prepare(`
      INSERT INTO app_state (id, payload, updated_at)
      VALUES (1, @payload, @updatedAt)
      ON CONFLICT(id) DO UPDATE SET
        payload = excluded.payload,
        updated_at = excluded.updated_at
    `);
  }

  loadState() {
    const row = this.selectStatement.get();
    if (!row) {
      return null;
    }
    return JSON.parse(row.payload);
  }

  saveState(state) {
    this.upsertStatement.run({
      payload: JSON.stringify(state),
      updatedAt: new Date().toISOString()
    });
  }

  getDatabasePath() {
    return this.dbPath;
  }
}

module.exports = { SchedulerDatabase };
