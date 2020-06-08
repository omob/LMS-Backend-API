const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const CourseActivitySchema = new Schema({
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    assignment: {
        type: Array,
        assignmentId: String,
        submissions: {
            default: [],
            type: Array,
            studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
            body: String,
            file: String,
            score: String
        }
    },
    test: {
        type: Array,
        testId: String,
        submissions: {
            default: [],
            type: Array,
            studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
            body: String,
            file: String,
            score: String
        }
    },
    attendance: {
        
    }
})

module.exports = Mongoose.model('CourseActivity', CourseActivitySchema);