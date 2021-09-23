const express = require("express");
const router = express.Router();
const db = require('../db');
const ExpressError = require("../expressError");

router.get('/', async (req, resp, next) => {
    // Get a list of companies.
    try {
        const results = await db.query(
            'SELECT * FROM companies'
        );
        return resp.json({"companies": results.rows});
    } catch (e) {
        return next(e);
    };
});

module.exports = router;
