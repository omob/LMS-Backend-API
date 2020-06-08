const router = require('express').Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const config = require('../config');
const { checkJwt } = require('../middleware');
const checkFileType= require('../utilities/functions');

const { StudentModel, ProgrammeModel, StudCourses, CourseModel, Employee } = require('../models');
const fs = require('fs');
const uploadPath = './public/uploads/courses/materials';

//TO-DO
//Only lecturers and admin should be able to access these APIs
//refactor the codes especially for course material

const storage = multer.diskStorage({
    destination: uploadPath,
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '-' + req.decoded.user._id 
            + Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 },
    fileFilter: (req, file, callback ) => {
        checkFileType(file, callback);
    }

}).single('courseMaterial');


//Get the courses the lecturer is taking
router.route('/courses')
    .get(checkJwt, (req, res, next) => {

        let lecturerId = req.decoded.user._id;
        
        const query = req.query.query;
        if(query == undefined || query == "undefined"){
            //select all courses from courses where lecturer == lecturerId
            CourseModel.find({})
                .where({"session.lecturer": lecturerId})
                .exec((err, result) => {
                    if(err) return res.json({success: false, message: err});
                    if(!result) return res.json({success: false, message: "No result"});

                    return res.json({success: true, message: "Successful", data: result});
                })
        }else{
            res.send("There's query");
        }   
        //should be able to list out all courses offered by student
        
        //should be able to sort courses based on level and sememster

    })
    .post(checkJwt, (req, res) => {

    })

router.get('/courses/:id', checkJwt, (req, res, next) => {
    let courseId = req.params.id;
    console.log(req.query)

    if(req.query !== "undefined"){
        let session = req.query.session;
        let semester = req.query.semester;

        //first we get total student offering the course before we get the course detail itself

        //get total student offering a course. filter session and semester
        // StudCourses.find({ $and: [ { "sessions.semesters.courses.course": courseId }, { "sessions.semesters.semesterType": "first" } ] })

        StudCourses.find({})
        .where({ "sessions.semesters.courses.course": courseId })
        .and({ "sessions.sessionName": session, "sessions.semesters.semesterType": semester.toLowerCase() } )
        .countDocuments()    
        .exec((err, result) => {
                if(err) {
                    console.log(err);
                    return res.json({ success: false, message: err})
                }
                else{
                    
                    //find course based on courseId
                    CourseModel.findById(courseId)
                    .populate({ path: 'programme', select: 'name requiredUnits', model: ProgrammeModel })
                    .populate({ path: 'session.lecturer', model: Employee, select: 'name.firstName name.lastName'})
                    .exec((err, course) => {
                        if(err) return  res.json({ success: false, message: "Unsuccessful"});

                        if(!course) return res.json({ success: false, message: "Course does not exist"});
                        
                        let courseResponse = course;
                        courseResponse.students = result 

                        return  res.json({ success: true, message: "Successful", data: courseResponse, students: result });
                    });
                }
            })

    }else{

        CourseModel.findById(courseId)
        .populate({ path: 'programme', select: 'name requiredUnits', model: ProgrammeModel })
        .populate({ path: 'session.lecturer', model: Employee, select: 'name.firstName name.lastName'})
        .exec((err, course) => {
            if(err) return  res.json({ success: false, message: "Unsuccessful"});
    
            if(!course) return res.json({ success: false, message: "Course does not exist"});
            
            let courseResponse = course;
    
            return  res.json({ success: true, message: "Successful", data: courseResponse, students: null });
        });
    }

})

router.put('/courses/:id', checkJwt, (req, res, next) => {
    let courseId = req.params.id;

    console.log(req.body);
    console.log(req.query)
    //we can only have one course per session, either in first or second semester
    let session = req.body.session;
    let semester = req.body.semester;

    //find course based on courseId
    CourseModel.findById(courseId)
    .select('session')
    .exec((err, course) => {
        if(err) return  res.json({ success: false, message: "Unsuccessful"});

        if(!course) return res.json({ success: false, message: "Course does not exist"});
        
        // console.log(course)

        let _session = course.session.find(c => (c.sessionName == session) && (c.semester.toLowerCase() == semester.toLowerCase()));
        let index = course.session.indexOf(_session);

        if(req.query.category == "courseOutline"){
            let courseOutlines = req.body.outlines;
            _session.courseOutline = courseOutlines;
        }
        if(req.query.category == "courseMaterial"){
            let courseMaterial = req.body.material;
            console.log(courseMaterial);

            // console.log(_session.courseMaterial)
            let index;
            _session.courseMaterial.map((x, i, ) => {
                if(courseMaterial.title == x.title && courseMaterial.body == x.body) {
                    index = i;
                }
            });

            if(index) _session.courseMaterial.splice(index,1);
            else _session.courseMaterial.push(courseMaterial);

        }
        if(req.query.category == "assignment"){
            let assignment = req.body.assignment;
            if(_session.assignment) _session.assignment.splice(0, 0, assignment);
            else {
                _session.assignment = [];
                _session.assignment.splice(0, 0, assignment);
            }
        }

        if(req.query.category == "assignments"){
            let assignments = req.body.assignments;
            _session.assignment = assignments;
        }

        course.session.splice(index, 1, _session);

        course.save((err, done) => {
            if(err) res.json({ success: false, message: "Error saving "+ err});
           
            return  res.json({ success: true, message: "Successful", data: course });
        })
        
    });
});


//upload course material.
router.put('/courses/uploads/:id', checkJwt, (req, res, next) => {
    upload( req, res, (err, data) => {

        if(err) console.log({ success: false, message: err });

        // if(req.file === undefined) return res.json({ success: false, message: 'No file uploaded'});

        // save file path to db here
        //extract data from req.body
        let courseId = req.params.id;
        let session = req.body.session;
        let semester = req.body.semester;
        let courseMaterial = {
            title: req.body.title,
            body: req.body.body,
            file: ( req.file ? config.host + `/uploads/courses/materials/${req.file.filename}` : null)
        }

        //TO-DO -> name each folder by department
        console.log(req.body);
        console.log(req.file);
        
        //find course based on courseId
        CourseModel.findById(courseId)
        .select('session')
        .exec((err, course) => {
            if(err) return  res.json({ success: false, message: "Unsuccessful"});
    
            if(!course) return res.json({ success: false, message: "Course does not exist"});
            
            console.log(course)
    
            let _session = course.session.find(c => (c.sessionName == session) && (c.semester.toLowerCase() == semester.toLowerCase()));
            let index = course.session.indexOf(_session);
    
            //TO-DO
            //check that a course material with the same title doesnt already exist in the array.\
            //if it does, replace, else push

            _session.courseMaterial.push(courseMaterial);
    
            course.session.splice(index, 1, _session);
    
            course.save((err, done) => {
                if(err) res.json({ success: false, message: "Error saving "+ err});
               
                console.log("saved", course)
                return  res.json({ success: true, message: "Successful", data: course });
            })
            
        });
    })
})

module.exports = router;