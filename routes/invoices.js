const express = require("express");
const router = express.Router();
const db = require('../db');
const ExpressError = require("../expressError");

router.get('/', async (req, resp, next) => {
    // Get a list of invoices.
    try {
        const results = await db.query(
            'SELECT * FROM invoices'
        );
        return resp.json({"invoices": results.rows});
    } catch (e) {
        return next(e);
    };
});

module.exports = router;