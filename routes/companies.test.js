process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require('../db');
const app = require("../app");

let otelloCorp = {
    code: "otc",
    name: "Otello, Inc.",
    description: "Harrassing cats since 2015."
};

beforeEach(async() => {
    const { code, name, description } = otelloCorp;
    await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
    `, [ code, name, description ]);
});

afterEach(async() => {
    await db.query(`
        DELETE FROM companies
    `);
});

describe("GET /companies", () => {
    test("Returns a list of companies", async () => {
        const resp = await request(app).get(`/companies`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({companies: [otelloCorp]});
    });
});

describe("GET /companies/:code", () => {
    test("Returns information on a single company by company code", async() => {
        const resp = await request(app).get(`/companies/${otelloCorp.code}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({company: otelloCorp});
    });
});

describe("POST /companies", () => {
    test("Add a new company", async() => {
        const colonelDoof = {
            code: "cdw",
            name: "Colonel Doofwaddle, LLC",
            description: "Is it a dog or what?"
        };
        const resp = await request(app)
            .post(`/companies`)
            .send(colonelDoof);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({company: colonelDoof});
    });
});

describe("PUT /companies/:code", () => {
    test("Edit an existing company's data", async() => {
        const otelloRev = {
            description: "Pretty darn cute."
        };
        const resp = await request(app)
            .put(`/companies/${otelloCorp.code}`)
            .send(otelloRev);
        for (let key in otelloCorp) {
            if (key !== "description") {
                otelloRev[key] = otelloCorp[key];
            };
        };
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({company: otelloRev});
    });
});

describe("DELETE /companies/:code", () => {
    test("Delete a company from the database by code", async() => {
        const resp = await request(app).delete(`/companies/${otelloCorp.code}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({status: "deleted"});
    })
})