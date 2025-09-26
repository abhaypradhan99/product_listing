const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const Product = require('./models/product');

const app = express();
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/products';
mongoose.connect(mongoUri).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB connection error:', err));
const redisClient = redis.createClient({host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379});
redisClient.on('error', (err) => console.error('Redis error:', err));

// Product Add
app.post('/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        redisClient.del('products:*');
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Product Fetch with pagination
app.get('/products', async (req, res) => {
    const {limit = 10, page = 1} = req.query;
    const cacheKey = `products:limit=${limit}:page=${page}`;
    redisClient.get(cacheKey, async (err, cachedData) => {
        if (err) console.error(err);
        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }
        try {
            const skip = (page - 1) * limit;   
            const products = await Product.find().skip(skip).limit(parseInt(limit));
            const total = await Product.countDocuments();
            const response = { products, total, page: parseInt(page), pages: Math.ceil(total / limit) };
            redisClient.setex(cacheKey, 60, JSON.stringify(response));
            res.json(response);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
});
app.listen(3001, () => console.log('Product service running on port 3001'));
