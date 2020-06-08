const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const StudCoursesSchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    sessions: { type: Array,
        sessionName: { type: String },
        semesters: { type : Array, 
            semesterType: { type: String },
            courses: { type: Array,
                course: { type: Schema.Types.ObjectId, ref: 'Course'},
                result: { type: String }
            }
        }
    },
    created: { type: Date, default: Date.now },
})

/*
 Student schema should look like ---

 169074232: {
     2015/2016: {
         FirtSemester: [
             219092882,
             67637377662
         ]
     }
 }

*/
module.exports = Mongoose.model('StudCourses', StudCoursesSchema);