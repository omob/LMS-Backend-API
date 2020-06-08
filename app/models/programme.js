const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const ProgrammeSchema = new Schema({
    name: { type: String, required: true },
    requiredUnits: Number,
    programmeType: [{
        name: String, //fullTime/PartTime
        duration: String
    }],
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    created: { type: Date, default: Date.now },
})

module.exports = Mongoose.model('Programme', ProgrammeSchema);