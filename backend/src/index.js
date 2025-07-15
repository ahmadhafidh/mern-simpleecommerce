const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/carts', require('./routes/cart.routes'));
app.use('/api/invoice', require('./routes/invoice.routes'));
app.use('/api/statistics', require('./routes/statistics.routes'));

app.get('/', (req, res) => {
  res.send("Tokoonline API is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
