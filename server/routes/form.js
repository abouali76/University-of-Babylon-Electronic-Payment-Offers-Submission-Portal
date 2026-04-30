const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Submit Form (Company Info + Paragraphs)
router.post('/submit', async (req, res) => {
    const { companyData, formAnswers } = req.body;
    try {
        // 1. Insert/Update Company Info
        const companyResult = await db.run_async(
            `INSERT OR REPLACE INTO companies 
            (user_id, company_name, representative_name, phone, email, license_number, experience_years, gov_entities_count, capital, address, submission_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id, companyData.company_name, companyData.representative_name, companyData.phone, 
                companyData.email, companyData.license_number, companyData.experience_years, 
                companyData.gov_entities_count, companyData.capital, companyData.address, new Date().toISOString()
            ]
        );

        const companyId = companyResult.insertId || companyData.id;

        // 2. Insert/Update Form Answers
        await db.run_async(
            `INSERT OR REPLACE INTO form_submissions 
            (company_id, settlement_mechanism, commissions_discounts, intermediary_bank, delay_penalty, atm_commitment, student_cards_details, charging_centers, pos_commitment, integrated_system_details, special_cards_issuance) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                companyId, formAnswers.settlement_mechanism, formAnswers.commissions_discounts, 
                formAnswers.intermediary_bank, formAnswers.delay_penalty, formAnswers.atm_commitment, 
                formAnswers.student_cards_details, formAnswers.charging_centers, formAnswers.pos_commitment,
                formAnswers.integrated_system_details, formAnswers.special_cards_issuance
            ]
        );

        res.json({ message: 'Form submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Company Submission
router.get('/my-submission', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT c.*, s.* FROM companies c LEFT JOIN form_submissions s ON c.id = s.company_id WHERE c.user_id = ?',
            [req.user.id]
        );
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
