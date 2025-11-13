// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const productAdminRouter = require('./routes/admin/products');
const categoryAdminRouter = require('./routes/admin/categories');

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
