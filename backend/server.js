import express from 'express';
import axios from 'axios';
import Orders from './orders/ordersApi.js';
import Products from './products/productsApi.js';
import Users from './users/usersApi.js';
import Comments from './comments/commentsApi.js';
import authenticate from './middleware/authenticate.js';

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

app.post('/checkout', authenticate, async (req, res) => {
    try{
        const { items } = req.body;
        const userId = req.user.id; 

        if (!items) {
            return res.status(400).json({
                error: "items are required for checkout"
            });
        }

        const response = await axios.post('http://localhost:5000/api/orders/create', {
            userId,
            items
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        res.status(201).json({
            message: "Checkout completed successfully",
            order: response.data.order
        });

    } catch (err){
        console.error(`Checkout error: ${err}`);
        
        // If it's an axios error, pass through the response
        if (err.response) {
            return res.status(err.response.status).json(err.response.data);
        }
        
        return res.status(500).json({
            error: "Checkout failed"
        });
    }
});

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
        console.error(`Cannot start server: ${err}`);
        process.exit(1);
    }
    
    try {
        await UsersModel.sequelize.sync();
        await ProductsModel.sequelize.sync();
        await OrdersModel.sequelize.sync();
        await CommentsModel.sequelize.sync();
        console.log('All databases synced successfully');
    } catch (error) {
        console.error('Database sync failed:', error);
        process.exit(1);
    }
    
    console.log("Server started on port 5000");
});