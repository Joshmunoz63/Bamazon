const inquirer = require("inquirer");
const mysql = require("mysql");

// Create a new connection to the mysql bamazon database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'bamazon'
});

init();

function init() {
    // Connect to database
    connection.connect();

    // Print all products
    printProducts();
}

function printProducts() {
    // Query all entries in the products table
    connection.query("SELECT * FROM products", (err, res) => {
        if (err) throw err;

        // Create data for displaying a table
        let data = {};

        // Loop through results and add a new object to the data object
        for (let i = 0; i < res.length; i++) {
            data[res[i].id] = {
                ProductName: res[i].product,
                Price: `$${res[i].price}`
            };
        }

        // Print the data object as a table
        console.table(data);

        // Prompt for user input
        promptUser();
    });
}

function promptUser() {
    inquirer.prompt([
        {
            type: "number",
            message: "Enter the ID of the product you wish to purchase",
            name: "id"
        },
        {
            type: "number",
            message: "Enter the amount you wish to purchase",
            name: "amount"
        }
    ]).then(handleInput);
}

function handleInput(input) {
    // Query for the product with a matching id
    connection.query("SELECT * FROM products WHERE `id` = ?", input.id, (err, res) => {
        if (err) throw err;

        // Check if the stock is below what the user entered
        if (res[0].stock < input.amount) {
            console.log("Insufficient quantity!");
        } else {
            // Remove the purchased quantity from the database
            updateStock(input.id, res[0].stock - input.amount);

            // Print the customer's total
            let total = res[0].price * input.amount;
            console.log(`Total: $${total}`);

            // Disconnect from database
            connection.end();
        }
    });
}

function updateStock(id, newStock) {
    // Update stock of product with the specified id to the newStock amount
    connection.query("UPDATE products SET `stock` = ? WHERE `id` = ?", [newStock, id], (err) => {
        if (err) throw err;
    });
}