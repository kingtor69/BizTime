DROP DATABASE IF EXISTS biztime_test;

CREATE DATABASE biztime_test;

\c biztime_test;

-- Linux compatibility code added by Tor Kingdon
GRANT ALL PRIVILEGES ON DATABASE biztime_test TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    ind_code text PRIMARY KEY,
    ind_name text NOT NULL UNIQUE,
    ind_description text
);

CREATE TABLE companies_industries (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    ind_code text NOT NULL REFERENCES industries ON DELETE CASCADE
);