import {Router} from 'express';
import Products from './products.js';

const router = Router();

router.get('/', async (req, res) => {
    try{
        const products = await Products.findAll();
        res.status(200).json(products);
    } catch (err){
        console.error(`error getting products ${err}`);
        res.status(500).json({message: 'error getting products'});
    }
});

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


router.post('/create', async (req, res) => {
    try{
        const { name, description, price, available } = req.body;
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
            available
        });

        res.status(201).json({
            message: `Created product of id ${product.id} successfully`,
            product
        });

    }catch(err){
        console.error(`Error creating product of id ${req.params.id}: ${err}`);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

router.delete('/delete/:id', async (req, res) => {
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