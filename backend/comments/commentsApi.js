import Comments from './comments.js';
import Products from '../products/products.js';
import Users from '../users/users.js';
import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';

const router = Router();

// get comments under some product
router.get('/:id', async (req, res) => {
    try{
        const product = await Products.findByPk(req.params.id);
        
        if (!product){
            return res.status(404).json({
                message: `Product of id ${req.params.id} not found`
            });
        }

        const comments = await Comments.findAll({where: {productId: req.params.id}});
        
        // Fetch user names for comments that don't have them stored
        const commentsWithNames = await Promise.all(comments.map(async (comment) => {
            let firstName = comment.userFirstName;
            let lastName = comment.userLastName;
            
            // If names are missing, fetch from Users table
            if (!firstName || !lastName) {
                const user = await Users.findByPk(comment.userId, {
                    attributes: ['firstName', 'lastName']
                });
                firstName = user?.firstName || 'Unknown';
                lastName = user?.lastName || 'User';
            }
            
            return {
                id: comment.id,
                body: comment.body,
                userId: comment.userId,
                productId: comment.productId,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                userFirstName: firstName,
                userLastName: lastName
            };
        }));
        
        console.log('Comments with names:', commentsWithNames?.map(c => ({
            id: c.id,
            userFirstName: c.userFirstName,
            userLastName: c.userLastName,
            userId: c.userId
        })));
        
        res.status(200).json({
            message: "Retrieved comments successfully",
            comments: commentsWithNames
        })
    }catch(err){
        console.error(`Error getting comments under product of id ${req.params.id}: ${err}`);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// post a comment under some product
router.post('/:id', authenticate, async (req, res) => {
    try{
        const product = await Products.findByPk(req.params.id);
        
        if (!product){
            return res.status(404).json({
                error: `Product of id ${req.params.id} not found`
            });
        }

        const { body } = req.body;
        const userId = req.user.id; // Use authenticated user ID

        if (!body){
            return res.status(400).json({
                error: "body parameter should be provided"
            });
        }

        if (body.trim().length < 3){
            return res.status(400).json({
                error: "Body length should be at least 3 characters long"
            });
        }

        // Get the actual user data from database to prevent name spoofing
        const user = await Users.findByPk(userId, {
            attributes: ['firstName', 'lastName']
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const comment = await Comments.create({
            body: body.trim(), 
            userId, 
            userFirstName: user.firstName, // Use database values, not JWT
            userLastName: user.lastName,   // Use database values, not JWT
            productId: req.params.id
        });

        res.status(201).json({
            message: "Created comment successfully",
            comment
        });

    }catch(err){
        console.error(`Failed to post comment for a product of id ${req.params.id}: ${err}`);

        res.status(500).json({
            error: "Internal server error"
        });
    }
});

// endpoint to delete a comment 
router.delete('/:id', authenticate, async (req, res) => {
    try{
        const comment = await Comments.findByPk(req.params.id);
        if (!comment){
            return res.status(404).json({
                error: `Comment of id ${req.params.id} not found`
            });
        }

        if (req.user.id !== comment.userId && req.user.role !== 'admin'){
            return res.status(403).json({
                error: 'Access denied, you can not delete a comment of other user unless you have admin role'
            });
        }

        const deletedCount = await Comments.destroy({where: {id: req.params.id}});

        if (deletedCount === 0){
            return res.status(404).json({
                error: "No comments deleted. Maybe a wrong id endpoint is used"
            });
        }

        res.status(200).json({
            message: `Deleted comment of id ${req.params.id} successfully`
        });
    }catch(err){
        console.error(`Failed to delete a comment of id ${req.params.id}: ${err}`);

        res.status(500).json({
            error: "Internal server error"
        });
    }
});

export default router;