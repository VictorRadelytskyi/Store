import {Router} from 'express';
import Products from './products.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';

const router = Router();

// endpoint to get all products
router.get('/', async (req, res) => {
    try{
        let products = await Products.findAll();
        const query = req.query.query?.trim().toLowerCase();
        const category = req.query.category?.trim();

        console.log('Received category:', category); // Debug log
        console.log('Available categories:', [...new Set(products.map(p => p.category))]);

        if (query) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.description.toLowerCase().includes(query)
            );
        }
        
        if (category && category !== 'All Categories') {
            products = products.filter(p => 
                p.category.toLowerCase() === category
            );
        }

        res.status(200).json(products);
    } catch (err){
        console.error(`error getting products ${err}`);
        res.status(500).json({message: 'error getting products'});
    }
});

// endpoint to get all products categories
router.get('/categories', async (req, res) => {
    try{
        // select distinct categories from database
        const categories = await Products.findAll({
            attributes: ['category'],
            group: ['category'],
            raw: true
        });

        const uniqueCategories = categories
            .map(item => item.category)
            .filter(cat => cat != null);;

        res.status(200).json(uniqueCategories);
    } catch (err){
        console.error(`error getting categories ${err}`);
        res.status(500).json({message: 'error getting categories'});
    }
});

// endpoint to get specific product
router.get('/:id', async (req, res) => {
    try{
        const product = await Products.findByPk(req.params.id);

        if (!product){
            return res.status(404).json({
                error: `Product of id ${req.params.id} not found`
            });
        }

        res.status(200).json({
            message: `Found product of id ${req.params.id}`,
            product
        });

    }catch(err){
        console.error(`Error getting product of id ${req.params.id}: ${err}`);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

// admin-only endpoint to create product
router.post('/create', authenticate, authorize(['admin']), async (req, res) => {
    try{
        const { name, description, price, available, category } = req.body;
        if (!name || !description || price === undefined || available === undefined){
            return res.status(400).json({
                error: "Parameters name, description, price, and available should be provided"
            });
        }

        if (name.trim().length < 3){
            return res.status(400).json({
                error: "Name should be at least 3 characters long"
            });
        }

        if (description.trim().length < 5){
            return res.status(400).json({
                error: "Description should be at least 5 characters long"
            });
        }

        if (price <= 0){
            return res.status(400).json({
                error: 'Price should be positive'
            });
        }

        if (available < 0){
            return res.status(400).json({
                error: 'Only non-negative values are valid for available parameter'
            });
        }

        const product = await Products.create({
            name: name.trim(),
            description: description.trim(),
            price,
            available,
            category: category || null
        });

        res.status(201).json({
            message: `Created product of id ${product.id} successfully`,
            product
        });

    }catch(err){
        console.error(`Error creating product: ${err}`);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

// admin-only endpoint to delete product
router.delete('/delete/:id', authenticate, authorize(['admin']), async (req, res) => {
    try{
        const product = await Products.findByPk(req.params.id);
        
        if (!product){
            return res.status(404).json({
                error: `Product of id ${req.params.id} not found`
            });
        }

        const deletedCount = await Products.destroy({where: {id: req.params.id}});

        if (deletedCount === 0){
            return res.status(500).json({
                error: `Error deleting product of id ${req.params.id}`
            });
        }

        res.status(200).json({
            message: `Deleted product of id ${req.params.id} successfully`
        });

    }catch(err){
        console.error(`Error deleting product of id ${req.params.id}: ${err}`);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

export default router;