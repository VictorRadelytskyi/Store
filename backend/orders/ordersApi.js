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
        const {productId, userId, quantity} = req.body;

        if (!productId || !userId || !quantity){
            return res.status(400).json({
                error: "Parameters productId, userId and quantity should be provided"
            });
        }

        const foundProduct = await Products.findByPk(productId);
        if (!foundProduct){
            return res.status(404).json({
                error: `Product of id ${productId} not found`
            });
        }

        const foundUser = await Users.findByPk(userId);
        if (!foundUser){
            return res.status(404).json({
                error: `User of id ${userId} not found`
            });
        }

        if (quantity < 1){
            return res.status(400).json({
                error: "Quantity must be at least 1"
            });
        }

        const totalPrice = foundProduct.price * quantity;

        const createdOrder = await Orders.create({
            productId, 
            userId, 
            quantity,
            totalPrice
        });

        res.status(201).json({
            message: "Order created successfully",
            order: createdOrder
        });

    }catch(err){
        console.error(`Error creating order of id ${req.params.id} - ${err}`);

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

        if (status !== "pending" || status !== "delivered" || status !== "cancelled"){
            return res.status(400).json({
                error: "Invalid status parameter. Status should be either pending, delivered, or cancelled"
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

        const [updatedCount] = await Orders.update({status}, {where: {id: req.params.id}});
        
        if (updatedCount === 0){
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