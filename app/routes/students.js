/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable max-length-for-line */

const router = require("express").Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const config = require("../config");
const { checkJwt } = require("../middleware");
const {
  StudentModel,
  ProgrammeModel,
  StudCourses,
  CourseModel,
  Employee,
} = require("../models");

const uploadPath = "./public/uploads/students/";

const storage = multer.diskStorage({
  destination: uploadPath,
  filename: (req, file, callback) => {
    callback(
      null,
      `${file.fieldname}-${req.decoded.user._id}${Date.now()}${path.extname(
        file.originalname
      )}`
    );
  },
});

// Check file type
const checkFileType = (file, callback) => {
  // allowed ext
  const filetypes = /jpeg|jpg|png|gif|doc|docx|pdf/;
  // check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) return callback(null, true);
  return callback("Error: Invalid file type");
};

const upload = multer({
  storage,
  limits: { fileSize: 2000000 },
  fileFilter: (req, file, callback) => {
    checkFileType(file, callback);
  },
}).single("doc");

const createToken = (person, roles = []) => {
  const user = {
    _id: person._id,
    name: `${person.name.firstName} ${person.name.lastName}`,
    email: person.email,
    position: "student",
    roles,
    programmeId: `${person.programme._id}`,
  };

  return jwt.sign(
    {
      user,
    },
    config.sessionSecret,
    {
      expiresIn: config.tokenExpire,
    }
  );
};

const checkSession = (sessionN, sessions) =>
  sessions.find(({ sessionName }) => sessionName === sessionN);

const checkSemester = (semester, semesters) =>
  semesters.find(({ semesterType }) => semesterType === semester.toLowerCase());

const findUniqueInArray = (a, b) =>
  a.filter((a_) => !b.find((b_) => a_.course === b_.course));

router.post("/login", (req, res) => {
  const username = req.body.username || "";
  const password = req.body.password || "";

  if (username === "" || password === "") {
    return res.json({ success: false, message: "Fill all required fields..." });
  }

  if (username.substr(-4) === ".com") {
    const email = username;
    StudentModel.findOne({ email })
      .populate({ path: "programme", model: ProgrammeModel })
      .exec((err, student) => {
        if (err) throw err;

        if (!student) {
          return res.json({
            success: false,
            message: "No student record",
          });
        }

        const validPassword = student.comparePassword(password);
        if (!validPassword) {
          return res.json({
            success: false,
            message: "Invalid Username or Password",
          });
        }

        console.log(student);
        const token = createToken(student);

        return res.json({
          success: true,
          message: "Login Successful",
          token,
        });
      });
  } else {
    return res.json({
      success: false,
      message: "Invalid username or password...",
    });
  }
});

router.post("/change-password", (req, res) => {
  const { email } = req.body;
  const { password } = req.body;

  // validate email and send password change link to email with access token
  StudentModel.findOne({ email }, (err, student) => {
    if (err) {
      return res.json({
        success: false,
        message: `Unsuccessful: ${err.errmsg}`,
      });
    }

    if (!student) {
      return res.json({
        success: false,
        message: "Unsuccessful: No student with email found!",
      });
    }

    // eslint-disable-next-line no-param-reassign
    student.password = password;

    return student.save((saveError) => {
      if (saveError) {
        return res.json({
          success: false,
          message: `Unsuccessful: ${saveError}`,
        });
      }

      const token = createToken(student);

      return res.json({
        success: true,
        message: "Successful! Password changed",
        token,
      });
    });
  });
});

router
  .route("/profile")
  .get(checkJwt, (req, res) => {
    StudentModel.findOne({ _id: req.decoded.user._id })
      .populate({ path: "programme", select: "name requiredUnits" })
      .select("-password")
      .exec((err, student) => {
        if (err) {
          return res.json({
            success: false,
            message: `Unsuccessul: ${err}`,
          });
        }

        return res.json({
          success: true,
          data: student,
          message: "Successful",
        });
      });
  })
  .put(checkJwt, (req, res) => {
    // update student records

    StudentModel.findOne({ _id: req.decoded.user._id }, (err, student) => {
      if (err) return res.json({ success: false, message: "Unsuccessful" });

      if (req.body.name) student.name = req.body.name;
      if (req.body.address) student.address = req.body.address;
      if (req.body.mobile) student.mobile = req.body.mobile;
      if (req.body.telephone) student.telephone = req.body.telephone;
      if (req.body.sex) student.sex = req.body.sex;
      if (req.body.nationality) student.nationality = req.body.nationality;
      if (req.body.stateOfOrigin)
        student.stateOfOrigin = req.body.stateOfOrigin;
      if (req.body.localGov) student.localGov = req.body.localGov;
      if (req.body.address_current)
        student.address_current = req.body.address_current;
      if (req.body.address_permanent)
        student.address_permanent = req.body.address_permanent;
      if (req.body.dob) student.dob = req.body.dob;
      if (req.body.sponsor) student.sponsor = req.body.sponsor;
      if (req.body.nextOfKin) student.nextOfKin = req.body.nextOfKin;
      if (req.body.title) student.title = req.body.title;
      if (req.body.education) student.education = req.body.education;

      // if(req.body.programme) student.programme = req.body.programme;
      // if(req.body.programmeType) student.programmeType = req.body.programmeType;
      return student.save((saveError) => {
        if (saveError) {
          return res.json({
            success: false,
            message: `Unsuccessful: ${saveError}`,
          });
        }

        const token = createToken(student);
        return res.json({
          success: true,
          message: "Success updating profile",
          student,
          token,
        });
      });
    });
  });

// This API has to do with courses registered by students
router
  .route("/courses")
  .get(checkJwt, (req, res) => {
    const studentId = req.decoded.user._id;
    const { query } = req.query;
    if (query === undefined || query === "undefined") {
      StudCourses.find({ studentId })
        .populate({
          path: "sessions.semesters.courses.course",
          model: CourseModel,
          select: "_id courseCode courseName session",
          populate: {
            path: "session.lecturer",
            model: Employee,
            select: "name.firstName name.lastName",
          },
        })
        .exec((err, studcourses) => {
          if (err)
            return res.json({ success: false, message: `Error: ${err}` });

          if (!studcourses[0]) {
            return res.json({
              success: false,
              message: "Student has not registered yet",
            });
          }

          return res.json({
            success: true,
            message: "Successfull",
            data: studcourses[0],
          });
        });
    }
    // should be able to list out all courses offered by student
    // should be able to sort courses based on level and sememster
  })
  .post(checkJwt, (req, res) => {
    // to-do...make sure whoever is accessing this route is a student

    // studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    // session: {
    //     sessionName: { type: String },
    //     semester: { type : Array,
    //         semesterType: { type: String },
    //         courses: { type: Array }
    //     }
    // },

    // before a student can register, check if the student exist,
    // check if the student had already registered for the session
    // check if student had already registered for the semester
    // check if the student has not passed the maximum number of registration
    const studentId = req.decoded.user._id;
    const sessions = {
      sessionName: req.body.session,
      semesters: [
        {
          semesterType: req.body.semester.name.toLowerCase(),
          courses: req.body.semester.courses.map((courseId) => ({
            course: courseId,
            result: "",
          })),
        },
      ],
    };

    StudCourses.findOne({ studentId }, (err, student) => {
      if (err) return res.json({ success: false, message: "Error ", err });

      if (!student) {
        console.log(student, "STUDENT");
        const studentCourse = new StudCourses();
        // student first time registration
        studentCourse.studentId = studentId;
        studentCourse.sessions.push(sessions);
        return studentCourse.save((saveError, savedData) => {
          if (saveError) {
            return res.json({
              success: false,
              message: `Error saving: ${saveError}`,
            });
          }

          return res.json({
            success: true,
            message: "Successful",
            data: savedData,
          });
        });
      }
      // student exists
      // check session, semester and also if the
      const _session = checkSession(sessions.sessionName, student.sessions);

      if (_session === undefined) {
        console.log("New session registration");
        // A new session registration
        student.sessions.push(sessions);
        return student.save((savedError, savedData) => {
          if (savedError) {
            return res.json({
              success: false,
              message: `Error saving: ${savedError}`,
            });
          }

          return res.json({
            success: true,
            message: "Successful",
            data: savedData,
          });
        });
      }
      // check semester
      const _semester = checkSemester(
        sessions.semesters[0].semesterType,
        _session.semesters
      );

      if (_semester === undefined) {
        _session.semesters.push(sessions.semesters[0]);
        const index = student.sessions.findIndex(
          (s) => s.sessionName === sessions.sessionName
        );
        student.sessions.splice(index, 1, _session);
        return student.save((saveError, savedData) => {
          if (saveError) {
            return res.json({
              success: false,
              message: `Error saving: ${saveError}`,
            });
          }

          return res.json({
            success: true,
            message: "Successful",
            data: savedData,
          });
        });
      }

      // if semester exist, check courses that is not already registered
      console.log("Entered courses are ", sessions.semesters[0].courses);
      console.log("Current courses are ", _semester.courses);

      const diff = findUniqueInArray(
        sessions.semesters[0].courses,
        _semester.courses
      );
      // push the diff to the existing course
      _semester.courses.push(...diff);

      const index = _session.semesters.findIndex(
        (s) => s.semesterType === _semester.semesterType
      );
      _session.semesters.splice(index, 1, _semester);

      const index2 = student.sessions.findIndex(
        (s) => s.sessionName === _session.sessionName
      );

      student.sessions.splice(index2, 1, _session);

      return student.save((saveError, savedData) => {
        if (saveError) {
          return res.json({
            success: false,
            message: `Error saving: ${saveError}`,
          });
        }

        return res.json({
          success: true,
          message: "Successful",
          data: savedData,
        });
      });
    });
  });

router.get("/courses/:id", (req, res) => {
  const courseId = req.params.id;

  CourseModel.findById(courseId)
    .populate({
      path: "programme",
      select: "name requiredUnits",
      model: ProgrammeModel,
    })
    .populate({
      path: "session.lecturer",
      model: Employee,
      select: "name.firstName name.lastName",
    })
    .exec((err, course) => {
      if (err) return res.json({ success: false, message: "Unsuccessful" });

      if (!course)
        return res.json({ success: false, message: "Course does not exist" });

      return res.json({ success: true, message: "Successful", data: course });
    });
});

router
  .route("/profile/uploads")
  .post(checkJwt, (req, res) => {
    upload(req, res, (err) => {
      if (err) return res.json({ success: false, message: err });

      if (req.file === undefined)
        return res.json({ success: false, message: "No file uploaded" });

      // save file to db here
      return StudentModel.findById(req.decoded.user._id, (err, student) => {
        if (err) return res.json({ success: false, message: err });
        if (!student)
          return res.json({ success: false, message: "student not found" });

        student.documents.push({
          docName: req.body.docName,
          url: `${config.host}/uploads/students/${req.file.filename}`,
        });

        return student.save((saveError, files) => {
          if (saveError) {
            return res.json({
              success: false,
              message: `Unsuccessful: ${saveError}`,
            });
          }

          return res.json({
            success: true,
            message: "File Added Successfully",
            data: files.documents,
          });
        });
      });
    });
  })
  .delete(checkJwt, (req, res) => {
    const document = JSON.parse(req.query.document);

    StudentModel.findById(req.decoded.user._id, "documents", (err, result) => {
      if (err) return res.json({ success: false, message: err });

      const { documents } = result;
      // get index
      const index = documents.findIndex(
        (doc) => doc.docName === document.docName && doc.url === document.url
      );

      if (index === -1) {
        return res.json({ success: true, message: "File not found" });
      }
      // remove index from array
      documents.splice(index, 1);
      // delete from disk
      fs.unlink(uploadPath + document.url, (err) => {
        if (err) console.log(err);
        console.log("File Deleted...");
      });

      // save the remaining array
      result.documents = documents;
      return result.save((err, savedR) => {
        if (err) return res.json({ success: false, message: err });
        return res.json({
          success: true,
          message: "File deleted successfully",
          data: savedR.documents,
        });
      });
    });
  });

module.exports = router;

// work on adding courses
// viewing courses
// regisetering courses

// vi
