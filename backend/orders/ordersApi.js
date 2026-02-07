import {Router} from 'express';
import Orders from './orders.js';
import Products from '../products/products.js';
import Users from '../users/users.js';

const router = Router();

router.get('/', async (req, res) => {
    try{
        const orders = await Orders.findAll();
        return res.status(200).json(orders);
    } catch(err){
        console.error(`Error getting orders: ${err}`);
        res.status(500).json({error: "Error getting orders"});
    }
});

router.get('/:id', async (req, res) =>{
    try{
        const order = await Orders.findByPk(req.params.id);
        if (!order){
            return res.status(404).json({
                error: `Order of id ${req.params.id} not found`
            });
        }

        res.status(200).json({
            message: "Order found",
            order
        });

    } catch(err){
        console.error(`Error getting order of id ${req.params.id}: ${err}`);
        res.status(500).json({ error: "Error getting order" });
    }
});

router.get('/user_orders/:id', async (req, res) => {
    try{
        const user = await Users.findByPk(req.params.id);
        if (!user){
            return res.status(404).json({
                error: `User of id ${req.params.id} not found`
            });
        }

        const orders = await Orders.findAll({ where: { userId: req.params.id } });

        res.status(200).json({
            message: `Found orders for user of id ${req.params.id} successfully`,
            orders
        });
    }catch(err){
        console.error(`Error fetching orders of user of id ${req.params.id}: ${err}`);

        res.status(500).json({
            error: "Internal server error"
        });
    }
});

router.post('/create', async (req, res) => {
    try{
        const { userId, items } = req.body;

        // Validate required parameters
        if (!userId) {
            return res.status(400).json({
                error: "userId parameter is required"
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0){
            return res.status(400).json({
                error: "items parameter should contain a non-empty list of objects"
            });
        }

        // Check if user exists
        const foundUser = await Users.findByPk(userId);
        if (!foundUser){
            return res.status(404).json({
                error: `User of id ${userId} not found`
            });
        }

        // Validate items and calculate total price
        let totalPrice = 0;
        for (const item of items) {
            const { productId, quantity } = item;
            
            if (!productId || !quantity){
                return res.status(400).json({
                    error: "All objects in items list should contain both productId and quantity fields"
                });
            }

            if (!Number.isInteger(quantity) || quantity <= 0){
                return res.status(400).json({
                    error: `Invalid quantity ${quantity}: quantity should be a positive integer`
                });
            }

            const product = await Products.findByPk(productId);
            if (!product){
                return res.status(404).json({
                    error: `Product of id ${productId} not found`
                });
            }

            totalPrice += parseFloat(product.price) * quantity;
        }

        const createdOrder = await Orders.create({
            userId, 
            items,
            totalPrice: totalPrice.toFixed(2)
        });

        res.status(201).json({
            message: "Order created successfully",
            order: createdOrder
        });

    }catch(err){
        console.error(`Error creating order: ${err}`);

        res.status(500).json({
            error: "Internal server error"
        });
    }
});

router.patch('/change_status/:id', async (req, res) => {
    try{
        const { status } = req.body;
        if (!status){
            return res.status(400).json({
                error: 'No status parameter provided'
            });
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)){
            return res.status(400).json({
                error: "Invalid status parameter. Status should be one of: pending, processing, shipped, delivered, cancelled"
            });
        }

        const order = await Orders.findByPk(req.params.id);
        if (!order){
            return res.status(404).json({
                error: `Order of id ${req.params.id} not found`
            });
        }

        if (order.status === status){
            return res.status(400).json({
                error: "The status provided is already set"
            });
        }

        const updatedCount = await Orders.update({status}, {where: {id: req.params.id}});
        
        if (updatedCount[0] === 0){
            return res.status(500).json({
                error: `Error updating order of id ${req.params.id}`
            });
        }
        
        res.status(200).json({
            message: "Order status updated successfully"
        });
        
    }catch(err){
        console.error(`Error changing status of order of id ${req.params.id}: ${err}`);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});



export default router;