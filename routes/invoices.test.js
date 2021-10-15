process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require('../db');
const app = require("../app");

let otelloCorp = {
    code: "otc",
    name: "Otello, Inc.",
    description: "Harrassing cats since 2015."
};

let invTest = {
    comp_code: "otc",
    amt: 99,
    paid: true,
    paid_date: '2021-10-14T06:00:00.000Z'
};

beforeEach(async() => {
    const { code, name, description } = otelloCorp;
    await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
    `, [ code, name, description ]);
    const { comp_code, amt, paid, paid_date } = invTest;
    await db.query(`
        INSERT INTO invoices (comp_code, amt, paid, paid_date)
        VALUES ($1, $2, $3, $4)
    `, [ comp_code, amt, paid, paid_date ]);
});

afterEach(async() => {
    await db.query(`
        DELETE FROM invoices
    `);
    await db.query(`
        DELETE FROM companies
    `);
});

describe("GET /invoices", () => {
    test("Returns a list of invoices", async () => {
        const resp = await request(app).get(`/invoices`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body.invoices[0].comp_code).toEqual(invTest.comp_code);
        expect(resp.body.invoices[0].amt).toEqual(invTest.amt);
        expect(resp.body.invoices[0].paid).toEqual(invTest.paid);
        expect(resp.body.invoices[0].paid_date).toEqual(invTest.paid_date);
    });
});

describe("GET /invoices/:id", () => {
    test("Returns information on a single invoice by invoice code", async() => {
        const idResp = await db.query(`SELECT id FROM invoices`);
        idTest = idResp.rows[0].id;
        const resp = await request(app).get(`/invoices/${idTest}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body.invoice.comp_code).toEqual(invTest.comp_code);
        expect(resp.body.invoice.amt).toEqual(invTest.amt);
        expect(resp.body.invoice.paid).toEqual(invTest.paid);
        expect(resp.body.invoice.paid_date).toEqual(invTest.paid_date);
    });
});

describe("POST /invoices", () => {
    test("Add a new invoice", async() => {
        const invPost = {
            comp_code: "otc",
            amt: 1000000,
            paid: false
        };
        const resp = await request(app)
            .post(`/invoices`)
            .send(invPost);
        expect(resp.statusCode).toBe(201);
        expect(resp.body.invoice.comp_code).toEqual(invPost.comp_code);
        expect(resp.body.invoice.amt).toEqual(invPost.amt);
        expect(resp.body.invoice.paid).toEqual(invPost.paid);
    });
});

describe("PUT /invoices/:id", () => {
    test("Edit an existing invoice's data", async() => {
        const invTestRev = {
            amt: 300000
        };
        const idResp = await db.query(`SELECT id FROM invoices`);
        idTest = idResp.rows[0].id;
        const resp = await request(app)
            .put(`/invoices/${idTest}`)
            .send(invTestRev);
        expect(resp.statusCode).toBe(200);
        expect(resp.body.invoice.amt).toEqual(invTestRev.amt);
        expect(resp.body.invoice.paid).toEqual(invTest.paid);
        expect(resp.body.invoice.paid_date).toEqual(invTest.paid_date);
    });
});

describe("DELETE /invoices/:id", () => {
    test("Delete a invoice from the database by code", async() => {
        const idResp = await db.query(`SELECT id FROM invoices`);
        idTest = idResp.rows[0].id;
        const resp = await request(app).delete(`/invoices/${idTest}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({status: "deleted"});
    })
})