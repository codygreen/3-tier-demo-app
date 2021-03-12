import express from 'express';
import Products from '../models/products';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const products = await Products.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json(err)
    }     
});

router.get('/:productId', async (req, res) => {
    try {
        const product = await Products.find({ id: req.params.productId })
        res.status(product.length > 0 ? 200 : 404).json(product)
    } catch (err) {
        res.status(500).json(err)
    }
});

module.exports = router