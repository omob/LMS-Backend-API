const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;


const CourseSchema = new Schema({
    courseName: { type: String, default: ""},
    courseCode: { type: String, unique: true },
    programme: { type: Schema.Types.ObjectId, ref: 'Programme' },
    units: { type: String, default: ""},
    session: { type: Array,
        sessionName: { type: String, unique: true},
        lecturer: { type: Schema.Types.ObjectId, ref: 'Employee' },
        courseMaterial: { type: Array },
        courseOutline: { type: Array },
        semester: { type: String },
        assignment: { 
            default: [],
            type: Array,
            id: Schema.Types.ObjectId,
            question: String,
            createdDate: Date,
            dueDate: Date,
            submissions: {
                default: [],
                type: Array,
                studentId: { type: Schema.Types.ObjectId, ref: 'Students' },
                body: String,
                file: String,
                score: String
            }
        }
    },
    created: { type: Date, default: Date.now }
})

// courseName: { type: String, default: ""},
// courseCode: { type: String, default: ""},
// programme: { type: Schema.Types.ObjectId, ref: 'Programme' },
// lecturer: { type: Schema.Types.ObjectId, ref: 'Employee' },
// units: { type: String, default: ""},
// courseMaterial: { type: Array },
// syllabus: { type: Array },
// created: { type: Date, default: Date.now }

module.exports = Mongoose.model('Course', CourseSchema);

/*
courseMaterial: [{
    title: String,
    body: String,
    file: String
}]

courseOutline: [
    {
        week: string,
        outlines: []
    }
]
*/