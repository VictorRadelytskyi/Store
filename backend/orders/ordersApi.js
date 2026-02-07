import {Router} from 'express';
import Orders from './orders.js';
import Products from '../products/products.js';
import Users from '../users/users.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';

const router = Router();

// admin endpoint to get all orders
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
    try{
        const orders = await Orders.findAll();
        return res.status(200).json(orders);
    } catch(err){
        console.error(`Error getting orders: ${err}`);
        res.status(500).json({error: "Error getting orders"});
    }
});

// user-specific endpoint to get user's order
router.get('/:id', authenticate, async (req, res) =>{
    try{
        const order = await Orders.findByPk(req.params.id);
        if (!order){
            return res.status(404).json({
                error: `Order of id ${req.params.id} not found`
            });
        }

        if (order.userId !== req.user.id && req.user.role !== 'admin'){
            return res.status(403).json({
                error: "Access denied. You can not view other user's orders unless you have admin role"
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

// user-specific endpoint to get all user's orders
router.get('/user_orders/:id', authenticate, async (req, res) => {
    try{
        const user = await Users.findByPk(req.params.id);
        if (req.user.role !== 'admin'){
            if (!user){
                // if user doesn't exist, it can't be an authenticated user, so return 403 to prevent enumeration
                return res.status(403).json({
                    error: "Access denied. You can not view other user's orders unless you have admin role"
                });
            }
            
            // separate condition check for null-safety
            if (user.id !== req.user.id){
                return res.status(403).json({
                    error: "Access denied. You can not view other user's orders unless you have admin role"
                });
            }
        }

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


// endpoint to create order for a normal user
router.post('/create', authenticate, async (req, res) => {
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
            // return 403 instead of 404 for normal users to prevent enumeration
            if (req.user.role !== 'admin'){
                return res.status(403).json({
                    error: "Access denied. You can not create an order for other user unless you have admin role"
                });
            } else{
                return res.status(404).json({
                    error: `User of id ${userId} not found`
                });
            }
        }

        if (userId !== req.user.id && req.user.role !== 'admin'){
            return res.status(403).json({
                error: "Access denied. You can not create an order for other user unless you have admin role"
            });
        }

        // Extract all product IDs and validate them in a single query to prevent N+1 problem
        const productIds = items.map(item => item.productId);
        const products = await Products.findAll({
            where: {
                id: productIds
            }
        });
        
        // Create a map for O(1) product lookups
        const productMap = products.reduce((map, product) => {
            map[product.id] = product;
            return map;
        }, {});

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

            const product = productMap[productId];
            if (!product){
                return res.status(404).json({
                    error: `Product of id ${productId} not found`
                });
            }

            // Check availability
            if (product.available < quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for product ${product.name}. Available: ${product.available}, Requested: ${quantity}`
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

// admin endpoint to change status of an order
router.patch('/change_status/:id', authenticate, authorize(['admin']), async (req, res) => {
    try{
        const { status } = req.body;
        if (!status){
            return res.status(400).json({
                error: 'No status parameter provided'
            });
        }

        const validStatuses = ['pending', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)){
            return res.status(400).json({
                error: "Invalid status parameter. Status should be one of: pending, delivered, cancelled"
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