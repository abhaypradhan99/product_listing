const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    desciption:{ type: String}
});
module.exports = mongoose.model('Product', productSchema);