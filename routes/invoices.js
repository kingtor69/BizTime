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
        return resp.json({invoices: results.rows});
    } catch (e) {
        return next(e);
    };
});

router.get('/:id', async (req, resp, next) => {
    // get information on a specific invoice
    try {
        const { id } = req.params;
        const results = await db.query(
            `SELECT * FROM invoices WHERE id=$1`, [id]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Unable to locate invoice with id ${id}.`, 404);
        };
        return resp.json({invoice: results.rows[0]});
    } catch (e) {
        return next(e);
    };
});

router.post('/', async (req, resp, next) => {
    // add a new invoice
    try {
        const { id, comp_code, amt, paid, paid_date } = req.body;
        const results = await db.query(
            `INSERT INTO invoices
            (id, comp_code, amt, paid, paid_date)
            VALUES ($1, $2, $3)
            RETURNING (id, comp_code, amt, paid, paid_date)`,
            [ id, comp_code, amt, paid, paid_date ]
        );
        return resp.status(201).json({invoice: results.rows[0]});
    } catch (e) {
        return next(e);
    };
});

router.put('/:id', async (req, resp, next) => {
    // edit information on a specific invoice
    try {
        const { id } = req.params;
        let { comp_code, amt, paid, paid_date } = req.body;
        if (!comp_code) {
            comp_code_results = await db.query(
                `SELECT comp_code 
                FROM invoices
                WHERE id=$1`, [ id ]
            );
            comp_code = comp_code_results.rows[0].comp_code;
        };
        if (!amt) {
            amt_results = await db.query(
                `SELECT amt 
                FROM invoices
                WHERE id=$1`, [ id ]
            );
            amt = amt_results.rows[0].amt;
        };
        if (!paid) {
            paid_results = await db.query(
                `SELECT paid 
                FROM invoices
                WHERE id=$1`, [ id ]
            );
            paid = paid_results.rows[0].paid;
        };
        if (!paid_date) {
            paid_date_results = await db.query(
                `SELECT paid_date 
                FROM invoices
                WHERE id=$1`, [ id ]
            );
            paid_date = paid_date_results.rows[0].paid_date;
        };

        const results = await db.query(
            `UPDATE invoices
            SET comp_code=$1,
            amt=$2,
            paid=$3,
            paid_date=$4
            WHERE id=$5
            RETURNING id, comp_code, amt, paid, paid_date, add_date`,
            [ comp_code, amt, paid, paid_date, id ]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Unable to locate invoice with id ${id}.`, 404);
        };
        return resp.json({invoice: results.rows[0]});
    } catch (e) {
        return next(e);
    };
});

router.delete('/:id', async (req, resp, next) => {
    try {
        const { id } = req.params;
        const id_results = await db.query(
            `SELECT id
            FROM invoices
            WHERE id=$1`,
            [ id ]
        );
        if (id_results.rows.length === 0) {
            throw new ExpressError(`Unable to locate invoice with id ${id}.`, 404);
        };
        const results = await db.query(
            `DELETE FROM invoices WHERE id=$1`, [id]
        );
        return resp.json({status: "deleted"});
    } catch (e) {
        return next(e);
    };
 
})

module.exports = router;
