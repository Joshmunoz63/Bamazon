DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
	`id` INT NOT NULL AUTO_INCREMENT,
    `product` VARCHAR(100),
    `department` VARCHAR(100),
    `price` DECIMAL(10, 2),
    `stock` INT DEFAULT 0,
    PRIMARY KEY(`id`)
);