import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import apiRoutes from './lib/routes.js';
import { serverDb } from './lib/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Serve static files
app.use(express.static(__dirname));

// Seed database from servers.json on first run
function seedDatabase() {
    if (serverDb.isEmpty()) {
        const seedFile = join(__dirname, 'servers.json');
        if (existsSync(seedFile)) {
            try {
                const data = JSON.parse(readFileSync(seedFile, 'utf-8'));
                if (data.servers && Array.isArray(data.servers)) {
                    serverDb.seedFromJson(data.servers);
                    console.log(`Seeded database with ${data.servers.length} servers from servers.json`);
                }
            } catch (error) {
                console.error('Failed to seed database:', error.message);
            }
        } else {
            console.log('No servers.json found, starting with empty database');
        }
    }
}

// Initialize and start server
seedDatabase();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   J.A.R.V.I.S. Dashboard Server                               ║
║   ─────────────────────────────────────────────────────────   ║
║                                                               ║
║   Status:   ONLINE                                            ║
║   Port:     ${String(PORT).padEnd(48)}║
║   URL:      http://localhost:${String(PORT).padEnd(37)}║
║                                                               ║
║   "At your service, sir."                                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
});
