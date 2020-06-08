const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const PositionSchema = new Schema({
    name: { type: String, unique: true },
    created: { type: Date, default: Date.now },
})

module.exports = Mongoose.model('Position', PositionSchema);