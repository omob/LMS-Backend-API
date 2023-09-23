const router = require("express").Router();
const { checkJwt, adminAuth } = require("../middleware");
const {
  Faculty,
  Department,
  ProgrammeModel,
  CourseModel,
  StudentModel,
  Employee,
  Role,
} = require("../models");
const { nationality } = require("../services");
// TO-DO
// work on differentiating applicants from students
router.route("/applicant/register").post((req, res, next) => {
  // This API is for Applicants

  const student = new StudentModel();

  student.name = req.body.name || "";
  student.address = req.body.address || "";
  student.email = req.body.email || "";
  student.mobile = req.body.mobile || "";
  student.telephone = req.body.telephone || "";
  student.sex = req.body.sex || "";
  student.nationality = req.body.nationality || "";
  student.stateOfOrigin = req.body.stateOfOrigin || "";
  student.localGov = req.body.localGov || "";
  student.address_current = req.body.address_current || {};
  student.address_permanent = req.body.address_permanent || {};
  student.dob = req.body.dob || "";
  student.sponser = req.body.sponser || {};
  student.nextOfKin = req.body.nextOfKin || {};
  student.password = req.body.name.lastName.toLowerCase();

  if (req.body.programme) student.programme = req.body.programme;
  if (req.body.programmeType) student.programmeType = req.body.programmeType;

  StudentModel.findOne({ email: req.body.email }, (err, existingStudent) => {
    if (existingStudent) {
      res.json({
        success: false,
        message: "Account with that email already exist",
      });
    } else {
      student.save((err) => {
        if (err) {
          return res.json({ success: false, message: `Unsuccessful ${err}` });
        }

        const token = createToken(student, "student");

        res.json({
          success: true,
          message: "Application successful",
          token,
        });
      });
    }
  });
});

router
  .route("/faculty")
  .get((req, res, next) => {
    Faculty.find({}, (err, faculties) => {
      if (err) {
        return res.json({
          success: false,
          message: "Error getting faculty",
        });
      }

      return res.json({
        success: true,
        faculties,
        message: "Successful",
      });
    });
  })
  .post(checkJwt, adminAuth, (req, res, next) => {
    const faculty = new Faculty();
    faculty.name = req.body.name;

    faculty.save((err) => {
      if (err) {
        return res.json({
          success: false,
          message: err.errmsg,
        });
      }

      return res.json({
        success: true,
        message: "Successful",
      });
    });
  });

router
  .route("/departments")
  .get((req, res, next) => {
    // use name to get the id under faculty, then use id to sort in department

    if (req.query.faculty) {
      const query = req.query.faculty;
      Faculty.find({}, (err, faculties) => {
        if (err) {
          return res.json({ success: false, message: `Unsucessful ${err}` });
        }

        const result = faculties.filter(
          (faculty) =>
            query.trim().toLowerCase() === faculty.name.toLowerCase() ||
            query.trim() == faculty._id
        )[0];

        if (!result) {
          return res.json({
            success: false,
            message: "Unsuccessful, invalid query",
          });
        }

        Department.find({ faculty: result._id })
          .populate({ path: "faculty", model: Faculty, select: "name" })
          .exec((err, departments) => {
            if (err) {
              return res.json({
                success: false,
                message: "Could not get list of departments",
              });
            }

            return res.json({
              success: true,
              departments,
              message: "Successful",
            });
          });
      });
    } else {
      Department.find()
        .populate({ path: "faculty", model: Faculty, select: "name" })
        .exec((err, departments) => {
          if (err) {
            return res.json({
              success: false,
              message: "Could not get list of departments",
            });
          }

          res.json({
            success: true,
            data: departments,
            message: "Successful",
          });
        });
    }
  })
  .post(checkJwt, adminAuth, (req, res, next) => {
    const department = new Department();

    if (req.body.name) department.name = req.body.name;
    if (req.body.faculty) department.faculty = req.body.faculty;

    department.save((err, updatedDepartment) => {
      if (err) {
        return res.json({
          success: false,
          message: err.errmsg,
        });
      }

      return res.json({
        success: true,
        message: "Successful",
        data: updatedDepartment,
      });
    });
  });

router
  .route("/programmes")
  .get((req, res, next) => {
    if (req.query.department) {
      ProgrammeModel.find(
        { department: req.query.department },
        (err, programmes) => {
          if (err) {
            return res.json({
              success: false,
              message: "Could not get list of programmes",
            });
          }

          return res.json({
            success: true,
            data: programmes,
            message: "Successful",
          });
        }
      );
    }

    ProgrammeModel.find({}, (err, programmes) => {
      if (err) {
        return res.json({
          success: false,
          message: "Could not get list of programmes",
        });
      }

      return res.json({
        success: true,
        data: programmes,
        message: "Successful",
      });
    });
  })
  .post(checkJwt, adminAuth, (req, res, next) => {
    const programme = new ProgrammeModel();

    const { name } = req.body;
    const { requiredUnits } = req.body;
    const { programmeType } = req.body;
    const { department } = req.body;

    if (name) programme.name = name;
    if (requiredUnits) programme.requiredUnits = requiredUnits;
    if (programmeType) programme.programmeType = programmeType;
    if (department) programme.department = department;

    ProgrammeModel.find({ name, department }).exec((err, result) => {
      if (err) {
        return res.json({
          success: false,
          message: `Unsuccessful: ${err.errmsg}`,
        });
      }

      if (result.length) {
        return res.json({
          success: false,
          message: `Duplicate entry for ${name}`,
        });
      }

      // programme does not exist, now we can save
      programme.save((err) => {
        if (err) {
          return res.json({ success: false, message: `Unsuccessful: ${err}` });
        }

        return res.json({
          success: true,
          message: "Successfully added a programme",
        });
      });
    });
  });

// view all course under each faculty
/*
        An admin can view all courses based on faculty, and filter based on department, and programmes
        An admin can add courses based on
        A student can view courses based on his/her programmes
        A lecturer can view courses based on faculty and
    */

// API for all courses
router
  .route("/courses")
  .get((req, res, next) => {
    // should be ableto list out all courses based on department
    // should be able to sort courses based on level and sememster
    const { query } = req;

    console.log(query);
    if (Object.keys(query).length !== 0) {
      if (query.programmeId) {
        CourseModel.find({ programme: query.programmeId })
          .populate({
            path: "session.lecturer",
            model: Employee,
            select: "name.firstName name.lastName",
          })
          .select([
            "-session.assignment",
            "-session.courseMaterial",
            "-session.courseOutline",
          ])
          .exec((err, result) => {
            if (err) {
              return res.json({
                success: false,
                message: `Unsuccessful! ${err.errmsg}`,
              });
            }
            return res.json({
              success: true,
              message: "Successful",
              data: result,
            });
          });
      }
      if (query.departmentId) {
        /* sort courses out based on department */
      }
    } else {
      CourseModel.find({})
        .select([
          "-session.assignment",
          "-session.courseMaterial",
          "-session.courseOutline",
        ])
        .exec((err, results) => {
          if (err) {
            return res.json({
              success: false,
              message: `Unsuccessful! ${err.errmsg}`,
            });
          }

          if (results.length > 0) {
            return res.json({
              success: true,
              message: "Success",
              data: results,
            });
          }

          return res.json({
            success: true,
            message: "No courses available...",
          });
        });
    }
  })
  .post(checkJwt, adminAuth, (req, res) => {
    // should be able to post courses
    // only the lecturer assigned to a course should be able to post a course material

    const course = new CourseModel();

    if (req.body.courseName) course.courseName = req.body.courseName;
    if (req.body.courseCode) course.courseCode = req.body.courseCode;
    if (req.body.programmeId) course.programme = req.body.programmeId;
    if (req.body.units) course.units = req.body.units;

    if (req.body.session) course.session.push(req.body.session);

    // if(req.body.lecturerId) course.lecturer = req.body.lecturer;
    // if(req.body.courseMaterial) course.courseMaterial.push(req.body.courseMaterial);
    // if(req.body.syllabus) course.syllabus.push(req.body.syllabus);

    CourseModel.findOne(
      { courseName: req.body.courseName, courseCode: req.body.courseCode },
      (err, result) => {
        if (err) {
          return res.json({
            success: false,
            message: `Unsuccessful! ${err.errmsg}`,
          });
        }

        if (result) {
          return res.json({
            success: false,
            message: "Unsuccessful! Duplicate entry for course",
          });
        }

        course.save((err, courseSaved) => {
          if (err) {
            return res.json({
              success: false,
              message: `Unsuccessful! ${err.errmsg}`,
            });
          }

          res.json({
            success: true,
            message: "Success! ",
            data: courseSaved,
          });
        });
      }
    );
  });

// API for a single course
router
  .route("/courses/:id")
  .get((req, res, next) => {
    const { id } = req.params;

    CourseModel.findOne({ _id: id })
      .populate({ path: "programme", select: "name", model: ProgrammeModel })
      .populate({ path: "lecturer", select: "name", model: Employee })
      .exec((err, course) => {
        if (err) {
          return res.json({
            success: false,
            message: `Unsuccessful! ${err.errmsg}`,
          });
        }

        if (!course) {
          return res.json({
            success: false,
            message: "Unsuccessful!...Course not found",
          });
        }

        return res.json({
          success: true,
          message: "Successful! ",
          data: course,
        });
      });
  })
  .put(checkJwt, adminAuth, (req, res, next) => {
    const { id } = req.params;

    CourseModel.findOne({ _id: id }, (err, result) => {
      if (err) {
        return res.json({
          success: false,
          message: `Unsuccessful! ${err.errmsg}`,
        });
      }

      if (!result) {
        return res.json({ message: "Unsucessful! Course not found" });
      }

      if (req.body.courseName) result.courseName = req.body.courseName;
      if (req.body.courseCode) result.courseCode = req.body.courseCode;
      if (req.body.programmeId) result.programme = req.body.programmeId;
      if (req.body.session) result.session = req.body.session;
      if (req.body.units) result.units = req.body.units;

      result.save((err, updatedCourse) => {
        if (err) {
          return res.json({
            success: false,
            message: `Unsuccessful! ${err.errmsg}`,
          });
        }

        return res.json({
          success: true,
          message: "Successfully updated course.",
          data: updatedCourse,
        });
      });
    });
  });

router.get("/nationalities", (req, res, next) => {
  res.json(nationality.countries);
});

// get Roles

router.get("/roles", (req, res, next) => {
  Role.find({}, (err, roles) => {
    console.log(err);
    if (err) return res.json({ success: false, message: "Unsuccessful" });

    if (!roles) {
      return res.json({
        success: false,
        message: "No roles yet...Contact admin to add roles",
      });
    }

    return res.json({ success: true, message: "Successful", data: roles });
  });
});

module.exports = router;

function createToken(person, role) {
  const user = {
    _id: person._id,
    name: `${person.name.firstName} ${person.name.lastName}`,
    email: person.email,
    role,
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
}
