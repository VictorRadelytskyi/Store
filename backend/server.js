import express from 'express';
import Orders from './orders/ordersApi.js';
import Products from './products/productsApi.js';
import Users from './users/usersApi.js';
import Comments from './comments/commentsApi.js';

// Import models for database sync
import UsersModel from './users/users.js';
import ProductsModel from './products/products.js';
import OrdersModel from './orders/orders.js';
import CommentsModel from './comments/comments.js';

const app = express();

// Global middleware
app.use(express.json());

// Routes
app.use('/api/orders', Orders);
app.use('/api/products', Products);
app.use('/api/users', Users);
app.use('/api/comments', Comments);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(5000, async (err) => {
    if (err){
        console.log(`can not start server: ${err}`);
        return;
    }
    
    try {
        // Sync all databases
        await UsersModel.sequelize.sync();
        await ProductsModel.sequelize.sync();
        await OrdersModel.sequelize.sync();
        await CommentsModel.sequelize.sync();
        console.log('✅ All databases synced successfully');
    } catch (error) {
        console.error('❌ Database sync failed:', error);
        return;
    }
    
    console.log("🚀 Server started on port 5000");
});