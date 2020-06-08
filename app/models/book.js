const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const BookSchema = new Schema({
    title: String,
    author: String,
    programmeId: String,
    availability: String,
    publishedOn: Date,
    created: { type: Date, default: Date.now },
})

module.exports = Mongoose.model('Book', BookSchema);