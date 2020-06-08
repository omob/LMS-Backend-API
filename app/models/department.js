const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const DepartmentSchema = new Schema({
    name: { type: String, unique: true },
    faculty: { type: Schema.Types.ObjectId, ref: 'Faculty' },
    created: { type: Date, default: Date.now },
})

//todo- bug in mongoose, unique property not working
module.exports = Mongoose.model('Department', DepartmentSchema);