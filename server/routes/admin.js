const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    next();
};

// Get all submissions
router.get('/submissions', isAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM submissions ORDER BY "lastUpdated" DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all companies (users)
router.get('/users', isAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT username, name, role, created_at FROM users WHERE role = \'company\'');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
