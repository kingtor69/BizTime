-- all code copyright Colt Steele and/or Rithm School and/or Springboard except as noted

DROP DATABASE IF EXISTS biztime;

CREATE DATABASE biztime;

\c biztime;

-- Linux compatibility code added by Tor Kingdon
GRANT ALL PRIVILEGES ON DATABASE biztime TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS companies_industries;

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
    industry_code text PRIMARY KEY,
    industry_name text NOT NULL UNIQUE,
    industry_description text
);

CREATE TABLE companies_industries (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    industry_code text NOT NULL REFERENCES industries ON DELETE CASCADE
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('hks', 'Hear Kitty Studios', 'Audio post soup-to-nuts.');

INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-31'),
         ('ibm', 400, false, null),
         ('hks', 2, true, '2018-01-01');

INSERT INTO industries (industry_code, industry_name, industry_description)
    VALUES ('hard', 'Technology (Hardware)', 'computers and stuff'),
           ('soft', 'Technology (Software)', 'programs and stuff'),
           ('ent', 'Entertainment', 'movies and stuff'),
           ('snd', 'Sound', 'sounds and stuff');

INSERT INTO companies_industries (comp_code, industry_code)
    VALUES ('apple', 'hard'),
           ('ibm', 'hard'),
           ('apple', 'soft'),
           ('ibm', 'soft'),
           ('hks', 'ent'),
           ('hks', 'snd'),
           ('hks', 'soft');