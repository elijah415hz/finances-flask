CREATE DATABASE IF NOT EXISTS finances_db CHARACTER SET utf8mb4 collate utf8mb4_unicode_ci;
USE finances_db;

CREATE TABLE IF NOT EXISTS expenses (
    entry_id INT NOT NULL AUTO_INCREMENT,
    date DATE,
    vendor_id INT,
    amount FLOAT,
    broad_category_id SMALLINT,
    narrow_category_id SMALLINT,
    person_id INT,
    notes VARCHAR(100),
    PRIMARY KEY (entry_id)
);

CREATE TABLE IF NOT EXISTS vendor (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50),
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX vendor_name ON vendor(name);

CREATE TABLE IF NOT EXISTS broad_category (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50)
);
CREATE UNIQUE INDEX b_name ON broad_category(name);

CREATE TABLE IF NOT EXISTS narrow_category (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
);
CREATE UNIQUE INDEX n_name ON narrow_category(name);

CREATE TABLE IF NOT EXISTS income (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    amount FLOAT,
    source_id INT,
    earner_id INT,
    FOREIGN KEY (source_id) REFERENCES source(id),
    FOREIGN KEY (person_id) REFERENCES person_earner(id)
);

CREATE TABLE IF NOT EXISTS source (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50)
);
CREATE UNIQUE INDEX s_name ON source(name);

CREATE TABLE IF NOT EXISTS person_earner (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30)
);
CREATE UNIQUE INDEX pe_name ON person_earner(name);