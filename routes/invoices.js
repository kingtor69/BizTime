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
        const { comp_code, amt, paid, paid_date } = req.body;
        const results = await db.query(
            `INSERT INTO invoices
            (comp_code, amt, paid, paid_date)
            VALUES ($1, $2, $3, $4)
            RETURNING comp_code, amt, paid, paid_date`,
            [ comp_code, amt, paid, paid_date ]
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
        let { amt, paid } = req.body;
        invoiceLookup = await db.query(
            `SELECT comp_code, amt, paid, paid_date, add_date 
            FROM invoices
            WHERE id=$1`, [ id ]
        );
        if (invoiceLookup.rows.length === 0) {
            throw new ExpressError(`Unable to locate invoice with id ${id}.`, 404);
        };
        
        let comp_code = invoiceLookup.rows[0].comp_code;
        let paid_date = invoiceLookup.rows[0].paid_date;
        let invoiceAmt = invoiceLookup.rows[0].amt;
        let add_date = invoiceLookup.rows[0].add_date;
        if (invoiceLookup.rows[0].paid === paid) {
            amt = invoiceAmt;
            return resp.json({invoices: {
                id,
                comp_code,
                amt,
                paid,
                add_date,
                paid_date
            }});
        };
        if (!amt) {
            throw new ExpressError("You must send an amount to mark and invoice paid or unpaid an invoice.", 400);
        };
        if (paid) {
            if (invoiceAmt !== amt) {
                throw new ExpressError(`Sorry, partial payments are not supported. Amount paid must be ${invoiceAmt} to process.`, 400);
            };
            paid_date = new Date();
        } else {
            if (invoiceAmt !== (amt)) {
                throw new ExpressError(`Sorry, partial un-payments are not supported. Submitted amount must be ${invoiceAmt}.`, 400);
            };
            paid_date = null;
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
