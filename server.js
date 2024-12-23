const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 1000;
const FILE_PATH = path.join(__dirname, 'products.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve frontend files

// Read all products from the file
function readProductsFromFile() {
    if (!fs.existsSync(FILE_PATH)) return [];
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return data ? JSON.parse(data) : [];
}

// Write products to the file
function writeProductsToFile(products) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(products, null, 2));
}

// Route to get all products
app.get('/products', (req, res) => {
    const products = readProductsFromFile();
    res.json(products);
});

// Route to delete a product by ID
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    const products = readProductsFromFile();

    const updatedProducts = products.filter(product => product.id !== id);
    writeProductsToFile(updatedProducts);

    res.status(200).send('Product deleted');
});

// Route to get product details by ID for editing
app.get('/product/:id', (req, res) => {
    const id = req.params.id;
    const products = readProductsFromFile();

    const product = products.find(p => p.id === id);
    if (!product) return res.status(404).send('Product not found');

    res.json(product);
});

// Route to update a product
app.put('/product/:id', (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    const products = readProductsFromFile();

    const index = products.findIndex(product => product.id === id);
    if (index === -1) return res.status(404).send('Product not found');

    products[index] = { ...products[index], ...updatedData };
    writeProductsToFile(products);

    res.status(200).send('Product updated');
});

// Route to add a new product
app.post('/products', (req, res) => {
    const newProduct = { id: Date.now().toString(), ...req.body };
    const products = readProductsFromFile();

    products.push(newProduct);
    writeProductsToFile(products);

    res.status(201).send('Product added');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
