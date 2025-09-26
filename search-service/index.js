const express = require('express');
const { Client } = require('@elastic/elasticsearch');

const app = express();
app.use(express.json());

const esClient = new Client({ node: `http://${process.env.ELASTICSEARCH_HOST || 'localhost'}:9200` });

// Search products
app.get('/search', async (req, res) => {
    const { q } = req.query;
    try {
        const result = await esClient.search({
            index: 'products',
            body: {
                query: {
                    multi_match: {
                        query: q,
                        fields: ['name', 'description']
                    }
                }
            }
        });
        res.json(result.hits.hits.map(hit => hit._source));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3002, () => console.log('Search service running on port 3002'));