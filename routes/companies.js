const express = require("express");
const router = express.Router();
const db = require('../db');
const ExpressError = require("../expressError");
const slugify = require('slugify');

router.get('/', async (req, resp, next) => {
    // Get a list of companies.
    try {
        const results = await db.query(
            `SELECT code, name, description, i.industry_name
            FROM companies AS c
            JOIN companies_industries AS ci
            ON ci.comp_code = c.code
            JOIN industries AS i
            ON i.industry_code = ci.industry_code
            ORDER BY c.name
            `
        );
        const company0 = {};
        let i = 0;
        company0.code = results.rows[i].code;
        company0.name = results.rows[i].name;
        company0.description = results.rows[i].description;
        company0.industry_names = [results.rows[i].industry_name];
        const companies = [company0];
        for (let j=1; j < results.rows.length; j++) {
            if ((i in companies) && (results.rows[j].name === companies[i].name)) {
                companies[i].industry_names.push(results.rows[j].industry_name);
            } else {
                i++;
                const companyJ = {};
                companyJ.code = results.rows[j].code;
                companyJ.name = results.rows[j].name;
                companyJ.description = results.rows[j].description;
                companyJ.industry_names = [results.rows[j].industry_name];
                companies.push(companyJ);
            };
        };
        return resp.json({companies: companies});
    } catch (e) {
        return next(e);
    };
});

router.get('/:code', async (req, resp, next) => {
    // get information on a specific company
    try {
        const { code } = req.params;
        const results = await db.query(
            `SELECT code, name, description, i.industry_name
            FROM companies AS c
            JOIN companies_industries AS ci
            ON ci.comp_code = c.code
            JOIN industries AS i
            ON i.industry_code = ci.industry_code
            WHERE code = $1
            `, [ code ]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Unable to locate company with code ${code}.`, 404);
        };
        const company = {};
        company.code = results.rows[0].code;
        company.name = results.rows[0].name;
        company.description = results.rows[0].description;
        company.industry_names = [results.rows[0].industry_name];
        for (let i=1; i < results.rows.length; i++) {
            company.industry_names.push(results.rows[i].industry_name);
        };
        return resp.json({company: company});
    } catch (e) {
        return next(e);
    };
});

router.post('/', async (req, resp, next) => {
    // add a new company
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
                    `INSERT INTO companies
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
});

router.post('/industries/', async (req, resp, next) => {
    // associate a company with an industry
    try {
        const { comp_code, industry_code } = req.body;
        results = await db.query(
            `INSERT INTO companies_industries
            (comp_code, industry_code)
            VALUES ($1, $2)
            RETURNING comp_code, industry_code`,
            [ comp_code, industry_code ]
        );
        return resp.status(201).json({companies_industries: results.rows[0]});
    } catch(e) {
        return next(e);
    };
});

module.exports = router;