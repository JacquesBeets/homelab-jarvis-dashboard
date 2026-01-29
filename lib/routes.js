import { Router } from 'express';
import { serverDb } from './database.js';

const router = Router();

// GET /api/servers - List all servers
router.get('/servers', (req, res) => {
    try {
        const servers = serverDb.getAll();
        res.json(servers);
    } catch (error) {
        console.error('Error fetching servers:', error);
        res.status(500).json({ error: 'Failed to fetch servers' });
    }
});

// POST /api/servers - Create new server
router.post('/servers', (req, res) => {
    try {
        const { name, address, port, url, type, healthEndpoint, group, enabled } = req.body;

        // Require either URL or both address and port
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        if (!url && (!address || !port)) {
            return res.status(400).json({ error: 'Either URL or both address and port are required' });
        }

        const id = 'srv_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

        const server = serverDb.create({
            id,
            name,
            address: address || null,
            port: port ? parseInt(port) : null,
            url: url || null,
            type: type || 'custom',
            healthEndpoint: healthEndpoint || '/',
            group: group || 'other',
            enabled: enabled !== false
        });

        res.status(201).json(server);
    } catch (error) {
        console.error('Error creating server:', error);
        res.status(500).json({ error: 'Failed to create server' });
    }
});

// PUT /api/servers/reorder - Update sort order (MUST be before /:id route)
router.put('/servers/reorder', (req, res) => {
    try {
        const { order } = req.body;

        if (!Array.isArray(order)) {
            return res.status(400).json({ error: 'Order must be an array of server IDs' });
        }

        serverDb.reorder(order);
        res.json({ success: true });
    } catch (error) {
        console.error('Error reordering servers:', error);
        res.status(500).json({ error: 'Failed to reorder servers' });
    }
});

// GET /api/servers/:id - Get single server
router.get('/servers/:id', (req, res) => {
    try {
        const server = serverDb.getById(req.params.id);
        if (!server) {
            return res.status(404).json({ error: 'Server not found' });
        }
        res.json(server);
    } catch (error) {
        console.error('Error fetching server:', error);
        res.status(500).json({ error: 'Failed to fetch server' });
    }
});

// PUT /api/servers/:id - Update server
router.put('/servers/:id', (req, res) => {
    try {
        const { name, address, port, url, type, healthEndpoint, group, enabled } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (address !== undefined) updates.address = address;
        if (port !== undefined) updates.port = port ? parseInt(port) : null;
        if (url !== undefined) updates.url = url || null;
        if (type !== undefined) updates.type = type;
        if (healthEndpoint !== undefined) updates.healthEndpoint = healthEndpoint;
        if (group !== undefined) updates.group = group;
        if (enabled !== undefined) updates.enabled = enabled;

        const server = serverDb.update(req.params.id, updates);
        if (!server) {
            return res.status(404).json({ error: 'Server not found' });
        }

        res.json(server);
    } catch (error) {
        console.error('Error updating server:', error);
        res.status(500).json({ error: 'Failed to update server' });
    }
});

// DELETE /api/servers/:id - Delete server
router.delete('/servers/:id', (req, res) => {
    try {
        const deleted = serverDb.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Server not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting server:', error);
        res.status(500).json({ error: 'Failed to delete server' });
    }
});

export default router;
