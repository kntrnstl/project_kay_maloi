require('dotenv').config();
const express = require('express');
const cors = require('cors');

const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const productAdminRouter = require('./routes/admin/products');
const categoryAdminRouter = require('./routes/admin/categories');
const publicProductsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const adminOrdersRouter = require('./routes/admin/orders');


const app = express();

app.use(cors());
app.use(express.json());

// Default route
app.get('/', (req, res) => res.send({ message: 'API running...' }));

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin/products', productAdminRouter);
app.use('/api/admin/categories', categoryAdminRouter);
app.use('/api/products', publicProductsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin/orders', adminOrdersRouter);
app.use("/api/orders/my", require("./routes/myOrders"));
app.use("/api/admin/reports", require("./routes/admin/reports"));




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
