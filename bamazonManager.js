const inquirer = require("inquirer");
const mysql = require("mysql");

// Create a new connection to the mysql bamazon database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'bamazon'
});

const options = ["View Products", "View Low Inventory", "Add to Inventory", "Add New Product"];

init();

function init() {
    // Connect to database
    connection.connect();

    inquirer.prompt([
        {
            type: "list",
            message: "Select an action",
            choices: options,
            name: "action"
        }
    ]).then(handleInput);
}

function handleInput(input) {
    switch (input.action) {
        case "View Products":
            printProducts();
            break;
        case "View Low Inventory":
            printLowStock()
            break;
        case "Add to Inventory":
            addStock();
            break;
        case "Add New Product":
            addProduct();
            break;
    }
}

function printProducts() {
    // Query all entries in the products table
    connection.query("SELECT * FROM products", (err, res) => {
        if (err) throw err;

        // Print results to a table
        printToTable(res);

        // Disconnect from database
        connection.end();
    });
}

function printLowStock() {
    connection.query("SELECT * FROM products WHERE `stock` < 5", (err, res) => {
        if (err) throw err;

        // Print results to a table
        printToTable(res);

        // Disconnect from database
        connection.end();
    });
}

function addStock() {
    inquirer.prompt([
        {
            type: "number",
            message: "Enter ID of product",
            name: "id"
        },
        {
            type: "number",
            message: "Enter amount to add",
            name: "amount"
        }
    ]).then((input) => {
        connection.query("SELECT * FROM products WHERE `id` = ?", input.id, (err, res) => {
            if (err) throw err;

            // 
            let newStock = res[0].stock + input.amount;
            updateStock(input.id, newStock);

            // Disconnect from database
            connection.end();
        });
    });
}

function addProduct() {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter product name",
            name: "name"
        },
        {
            type: "input",
            message: "Enter department",
            name: "dept"
        },
        {
            type: "number",
            message: "Enter price",
            name: "price"
        },
        {
            type: "number",
            message: "Enter stock",
            name: "stock"
        }
    ]).then((input) => {
        connection.query(
            "INSERT INTO products (`product`, `department`, `price`, `stock`) VALUES (?, ?, ?, ?)",
            [input.name, input.dept, input.price, input.stock], (err) => {
                if (err) throw err;

                // Disconnect from database
                connection.end();
            }
        );
    });
}

function printToTable(products) {
    // Create data for displaying a table
    let data = {};

    // Loop through results and add a new object to the data object
    for (let i = 0; i < products.length; i++) {
        data[products[i].id] = {
            ProductName: products[i].product,
            Department: products[i].department,
            Price: `$${products[i].price}`,
            Stock: products[i].stock
        };
    }

    // Print the data object as a table
    console.table(data);
}

function updateStock(id, newStock) {
    // Update stock of product with the specified id to the newStock amount
    connection.query("UPDATE products SET `stock` = ? WHERE `id` = ?", [newStock, id], (err) => {
        if (err) throw err;
    });
}