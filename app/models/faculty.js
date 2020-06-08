const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const FacultySchema = new Schema({
    name: { type: String, unique: true },
    created: { type: Date, default: Date.now },
})


module.exports = Mongoose.model('Faculty', FacultySchema);