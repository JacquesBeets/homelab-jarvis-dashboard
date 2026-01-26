import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure db directory exists
const dbDir = join(__dirname, '..', 'db');
if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
}

const dbPath = join(dbDir, 'jarvis.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
    CREATE TABLE IF NOT EXISTS servers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        port INTEGER NOT NULL,
        type TEXT DEFAULT 'custom',
        health_endpoint TEXT DEFAULT '/',
        server_group TEXT DEFAULT 'other',
        enabled INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_servers_sort ON servers(sort_order);
    CREATE INDEX IF NOT EXISTS idx_servers_group ON servers(server_group);
`);

// Prepared statements for better performance
const statements = {
    getAll: db.prepare(`
        SELECT id, name, address, port, type, health_endpoint as healthEndpoint,
               server_group as "group", enabled, sort_order as sortOrder
        FROM servers
        ORDER BY sort_order ASC, name ASC
    `),

    getById: db.prepare(`
        SELECT id, name, address, port, type, health_endpoint as healthEndpoint,
               server_group as "group", enabled, sort_order as sortOrder
        FROM servers
        WHERE id = ?
    `),

    insert: db.prepare(`
        INSERT INTO servers (id, name, address, port, type, health_endpoint, server_group, enabled, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),

    update: db.prepare(`
        UPDATE servers
        SET name = ?, address = ?, port = ?, type = ?, health_endpoint = ?,
            server_group = ?, enabled = ?, updated_at = datetime('now')
        WHERE id = ?
    `),

    delete: db.prepare(`DELETE FROM servers WHERE id = ?`),

    updateSortOrder: db.prepare(`UPDATE servers SET sort_order = ? WHERE id = ?`),

    getMaxSortOrder: db.prepare(`SELECT MAX(sort_order) as maxOrder FROM servers`),

    count: db.prepare(`SELECT COUNT(*) as count FROM servers`)
};

export const serverDb = {
    getAll() {
        return statements.getAll.all().map(s => ({
            ...s,
            enabled: Boolean(s.enabled)
        }));
    },

    getById(id) {
        const server = statements.getById.get(id);
        if (server) {
            server.enabled = Boolean(server.enabled);
        }
        return server;
    },

    create(server) {
        const maxOrder = statements.getMaxSortOrder.get();
        const sortOrder = (maxOrder?.maxOrder ?? -1) + 1;

        statements.insert.run(
            server.id,
            server.name,
            server.address,
            server.port,
            server.type || 'custom',
            server.healthEndpoint || '/',
            server.group || 'other',
            server.enabled !== false ? 1 : 0,
            sortOrder
        );

        return this.getById(server.id);
    },

    update(id, updates) {
        const existing = this.getById(id);
        if (!existing) return null;

        statements.update.run(
            updates.name ?? existing.name,
            updates.address ?? existing.address,
            updates.port ?? existing.port,
            updates.type ?? existing.type,
            updates.healthEndpoint ?? existing.healthEndpoint,
            updates.group ?? existing.group,
            updates.enabled !== undefined ? (updates.enabled ? 1 : 0) : (existing.enabled ? 1 : 0),
            id
        );

        return this.getById(id);
    },

    delete(id) {
        const result = statements.delete.run(id);
        return result.changes > 0;
    },

    reorder(orderedIds) {
        const updateOrder = db.transaction((ids) => {
            ids.forEach((id, index) => {
                statements.updateSortOrder.run(index, id);
            });
        });
        updateOrder(orderedIds);
    },

    count() {
        return statements.count.get().count;
    },

    isEmpty() {
        return this.count() === 0;
    },

    seedFromJson(servers) {
        const insertMany = db.transaction((serverList) => {
            serverList.forEach((server, index) => {
                statements.insert.run(
                    server.id,
                    server.name,
                    server.address,
                    server.port,
                    server.type || 'custom',
                    server.healthEndpoint || '/',
                    server.group || 'other',
                    server.enabled !== false ? 1 : 0,
                    index
                );
            });
        });
        insertMany(servers);
    }
};

export default db;
