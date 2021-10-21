const express = require("express");
const router = express.Router();
const db = require('../db');
const ExpressError = require("../expressError");
const slugify = require('slugify');

router.get('/', async (req, resp, next) => {
    // Get a list of industries.
    try {
        const results = await db.query(
            'SELECT industry_code, industry_name, industry_description FROM industries'
        );
        return resp.json({industries: results.rows});
    } catch (e) {
        return next(e);
    };
});

router.post('/', async (req, resp, next) => {
    // add a new industry
    try {
        const { industry_name, industry_description } = req.body;
        const codeRaw = slugify(industry_name, {
            replacement: '', 
            lower: true, 
            remove: /[!@#$%^&*()]/g
        });
        let i = 3;
        let code = codeRaw.slice(0, i);
        let unique = false;
        let num = 1;
        let results;
        while(!unique) {
            try {
                results = await db.query(
                    `INSERT INTO industries
                    (industry_code, industry_name, industry_description)
                    VALUES ($1, $2, $3)
                    RETURNING industry_code, industry_name, industry_description`,
                    [ code, industry_name, industry_description ]
                );
                unique = true;
            } catch {
                if (i < codeRaw.length) {
                    code = code + codeRaw.slice(i, i+1);
                    i++;
                } else {
                    code = codeRaw + num;
                    num ++;
                };
            };
        };
        return resp.status(201).json({industry: results.rows[0]});
    } catch (e) {
        return next(e);
    };
});

module.exports = router;