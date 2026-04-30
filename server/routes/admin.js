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
        const [rows] = await db.execute(
            'SELECT c.*, s.* FROM companies c LEFT JOIN form_submissions s ON c.id = s.company_id ORDER BY c.submission_date DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific report data
router.get('/report/:id', isAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT c.*, s.* FROM companies c LEFT JOIN form_submissions s ON c.id = s.company_id WHERE c.id = ?',
            [req.params.id]
        );
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
