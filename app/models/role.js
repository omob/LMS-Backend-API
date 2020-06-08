const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const RoleSchema = new Schema({
    admin: {type: Array },
    student: { type: Array },
    lecturer: { type: Array },
    'super-admin': { type: Array },
    
    created: { type: Date, default: Date.now },
})


module.exports = Mongoose.model('Role', RoleSchema);
