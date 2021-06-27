CREATE DATABASE finances_db CHARACTER SET utf8mb4 collate utf8mb4_unicode_ci;
USE finances_db;

CREATE TABLE expenses (
    entry_id INT NOT NULL AUTO_INCREMENT,
    date DATE,
    vendor_id INT,
    amount FLOAT,
    broad_category_id INT,
    narrow_category_id INT,
    person_id INT,
    notes VARCHAR(100),
    PRIMARY KEY (entry_id)
);

CREATE TABLE vendor (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50),
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX vendor_name ON vendor(name);

CREATE TABLE broad_category (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50),
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX b_name ON broad_category(name);

CREATE TABLE narrow_category (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50),
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX n_name ON narrow_category(name);

CREATE TABLE income (
    id INT NOT NULL AUTO_INCREMENT,
    date DATE,
    amount FLOAT,
    source_id INT,
    earner_id INT,
    PRIMARY KEY (id)
);

CREATE TABLE source (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50),
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX s_name ON source(name);

CREATE TABLE person_earner (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30),
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX pe_name ON person_earner(name);


