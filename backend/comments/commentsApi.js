import Comments from './comments.js';
import Products from '../products/products.js';
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
        
        res.status(200).json({
            message: "Retrieved comments successfully",
            comments
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

        const comment = await Comments.create({
            body: body.trim(), 
            userId, 
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