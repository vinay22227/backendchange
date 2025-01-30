const mongoose = require('mongoose');

const routesSchema = new mongoose.Schema({
    name: { type: String, required: true },
    route: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('WebRoute', routesSchema);