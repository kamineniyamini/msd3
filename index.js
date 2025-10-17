const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const filePath = path.join(__dirname, 'products.json');

const readProducts = () => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading products.json', err);
    return [];
  }
};

const writeProducts = (products) => {
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
};

app.get('/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

app.get('/products/instock', (req, res) => {
  const products = readProducts();
  const inStockProducts = products.filter(p => p.inStock);
  res.json(inStockProducts);
});

app.post('/products', (req, res) => {
  const { name, price, inStock } = req.body;
  if (!name || price === undefined || inStock === undefined) {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  const products = readProducts();
  const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
  const newProduct = { id: newId, name, price, inStock };
  products.push(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, price, inStock } = req.body;

  const products = readProducts();
  const index = products.findIndex(p => p.id === productId);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  if (name !== undefined) products[index].name = name;
  if (price !== undefined) products[index].price = price;
  if (inStock !== undefined) products[index].inStock = inStock;

  writeProducts(products);
  res.json(products[index]);
});

app.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);

  const products = readProducts();
  const index = products.findIndex(p => p.id === productId);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  products.splice(index, 1);
  writeProducts(products);

  res.json({ message: 'Product deleted successfully' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
