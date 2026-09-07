-- Database schema placeholders for the Hair by Sentle backend.
-- TODO: add CREATE TABLE statements for users, orders, order_items, products, and other database objects.

DROP DATABASE IF EXISTS hairbysentle;
CREATE DATABASE hairbysentle;
USE hairbysentle;

CREATE TABLE Customer (
    CustomerID              INT AUTO_INCREMENT PRIMARY KEY,
    FirstName                VARCHAR(50) NOT NULL,
    LastName                 VARCHAR(50) NOT NULL,          -- "Surname" on the form
    Email                     VARCHAR(100) NOT NULL UNIQUE,
    Phone                     VARCHAR(20),                   
    PreferredContactMethod   VARCHAR(20) NOT NULL DEFAULT 'Email',  -- dropdown value (Email, Phone, WhatsApp, etc.)
    PasswordHash              VARCHAR(255) NOT NULL         -- store the HASH, never the raw password

);

SHOW TABLES;
DESCRIBE Customer;