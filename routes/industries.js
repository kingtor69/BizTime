const express = require("express");
const router = express.Router();
const db = require('../db');
const ExpressError = require("../expressError");
const slugify = require('slugify');

router.get('/', async (req, resp, next) => {
    // Get a list of industries.
    try {
        const results = await db.query(
            'SELECT * FROM industries'
        );
        return resp.json({industries: results.rows});
    } catch (e) {
        return next(e);
    };
});

router.get('/:code', async (req, resp, next) => {
    // get information on a specific industry
    try {
        const { code } = req.params;
        const results = await db.query(
            `SELECT * FROM industries WHERE code=$1`, [code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Unable to locate industry with code ${code}.`, 404);
        };
        return resp.json({industry: results.rows[0]});
    } catch (e) {
        return next(e);
    };
});

router.post('/', async (req, resp, next) => {
    // add a new industry
    try {
        const { name, description } = req.body;
        const codeRaw = slugify(name, {
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
                    (code, name, description)
                    VALUES ($1, $2, $3)
                    RETURNING code, name, description`,
                    [ code, name, description ]
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

router.put('/:code', async (req, resp, next) => {
    // edit information on a specific industry
    try {
        const { code } = req.params;
        let { name, description } = req.body;
        if (!name) {
            name_results = await db.query(
                `SELECT name 
                FROM industries
                WHERE code=$1`, [ code ]
            );
            name = name_results.rows[0].name;
        };
        if (!description) {
            description_results = await db.query(
                `SELECT description 
                FROM industries
                WHERE code=$1`, [ code ]
            );
            description = description_results.rows[0].description;
        };
        const results = await db.query(
            `UPDATE industries
            SET name=$1,
            description=$2
            WHERE code=$3
            RETURNING code, name, description`,
            [ name, description, code ]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Unable to locate industry with code ${code}.`, 404);
        };
        return resp.json({industry: results.rows[0]});
    } catch (e) {
        return next(e);
    };
});

router.delete('/:code', async (req, resp, next) => {
    try {
        const { code } = req.params;
        const code_results = await db.query(
            `SELECT code
            FROM industries
            WHERE code=$1`,
            [ code ]
        );
        if (code_results.rows.length === 0) {
            throw new ExpressError(`Unable to locate industry with code ${code}.`, 404);
        };
        const results = await db.query(
            `DELETE FROM industries WHERE code=$1`, [code]
        );
        return resp.json({status: "deleted"});
    } catch (e) {
        return next(e);
    };
 
})

module.exports = router;
