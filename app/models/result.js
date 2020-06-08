const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const ResultSchema = new Schema({
    studentId: String,
    courseId: String,
    score: Number,
    employeeId: String,
    programmeId: String,
    created: { type: Date, default: Date.now },
    postedBy: "",
});

module.exports = Mongoose.model('Result', ResultSchema);