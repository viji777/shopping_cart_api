const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 5000;

mongoose.connect("mongodb+srv://viji:1212@cluster0.zavcg7u.mongodb.net/cart?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log("Failed to connect DB", err);
  });

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  quantity: Number,
  total: Number,
  discountPercentage: Number,
  discountedTotal: Number,
  thumbnail: String
});

const cartSchema = new mongoose.Schema({
  id: Number,
  products: [productSchema],
  total: Number,
  discountedTotal: Number,
  userId: Number,
  totalProducts: Number,
  totalQuantity: Number
});

const mainSchema = new mongoose.Schema({
 
  carts: [cartSchema],
  total: Number,
  skip: Number,
  limit: Number
}, { collection: 'shopping_cart' });

const Main = mongoose.model('Main', mainSchema);
console.log(Main);

app.get('/carts', async (req, res) => {
  try {
    const result = await Main.find({});
    if (result.length === 0) {
      console.log('No carts found');
      return res.status(404).json({ message: 'No carts found' });
    }
    console.log('Fetched carts:', result);
    res.json({ carts: result[0].carts }); // Adjusted to return the carts array
  } catch (err) {
    console.error('Error fetching carts from database:', err);
    res.status(500).json({ error: 'Error fetching carts from database' });
  }
});

app.put('/carts/:id', async (req, res) => {
  const cartId = parseInt(req.params.id, 10);
  const updatedProducts = req.body.products;

  if (!Array.isArray(updatedProducts)) {
    return res.status(400).json({ error: 'Invalid products format' });
  }

  try {
    let mainDocument = await Main.findOne({});
    if (!mainDocument) {
      mainDocument = new Main({ carts: [] });
    }

    let cart = mainDocument.carts.find(cart => cart.id === cartId);

    if (!cart) {
      cart = { id: cartId, products: updatedProducts };
      mainDocument.carts.push(cart);
    } else {
      cart.products = updatedProducts;
    }

    await mainDocument.save();
    res.json(cart);
  } catch (err) {
    console.error('Error updating cart in database:', err);
    res.status(500).json({ error: 'Error updating cart in database' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
