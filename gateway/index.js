const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware');

const app = express();

const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
const searchServiceUrl = process.env.SEARCH_SERVICE_URL || 'http://localhost:3002';

app.use('/products', createProxyMiddleware({ target: productServiceUrl, changeOrigin: true , pathRewrite: {'^/products' : '/products'}}));

app.use('/search', createProxyMiddleware({ target: searchServiceUrl, changeOrigin: true , pathRewrite: {'^/search' : '/search'}}));

app.listen(3000, () => {
    console.log('API Gateway running on port 3000');
});