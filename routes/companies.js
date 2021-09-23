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
        return resp.json({companies: results.rows});
    } catch (e) {
        return next(e);
    };
});

router.get('/:code', async (req, resp, next) => {
    // get information on a specific company
    try {
        const { code } = req.params;
        const results = await db.query(
            `SELECT * FROM companies WHERE code=$1`, [code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Unable to locate company with code ${code}.`, 404);
        };
        return resp.json({company: results.rows[0]});
    } catch (e) {
        return next(e);
    };
});

router.post('/', async (req, resp, next) => {
    // add a new company
    try {
        const { code, name, description } = req.body;
        const results = await db.query(
            `INSERT INTO companies
            (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING (code, name, description)`,
            [ code, name, description ]
        );
        return resp.status(201).json({company: results.rows[0]});
    } catch (e) {
        return next(e);
    };
});

router.put('/:code', async (req, resp, next) => {
    // edit information on a specific company
    try {
        const { code } = req.params;
        let { name, description } = req.body;
        if (!name) {
            name_results = await db.query(
                `SELECT name 
                FROM companies
                WHERE code=$1`, [ code ]
            );
            name = name_results.rows[0].name;
        };
        if (!description) {
            description_results = await db.query(
                `SELECT description 
                FROM companies
                WHERE code=$1`, [ code ]
            );
            description = description_results.rows[0].description;
        };
        const results = await db.query(
            `UPDATE companies
            SET name=$1,
            description=$2
            WHERE code=$3
            RETURNING code, name, description`,
            [ name, description, code ]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Unable to locate company with code ${code}.`, 404);
        };
        return resp.json({company: results.rows[0]});
    } catch (e) {
        return next(e);
    };
});

router.delete('/:code', async (req, resp, next) => {
    try {
        const { code } = req.params;
        const code_results = await db.query(
            `SELECT code
            FROM companies
            WHERE code=$1`,
            [ code ]
        );
        if (code_results.rows.length === 0) {
            throw new ExpressError(`Unable to locate company with code ${code}.`, 404);
        };
        const results = await db.query(
            `DELETE FROM companies WHERE code=$1`, [code]
        );
        return resp.json({status: "deleted"});
    } catch (e) {
        return next(e);
    };
 
})

module.exports = router;
