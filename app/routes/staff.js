/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const config = require("../config");

const { checkJwt } = require("../middleware");
const { Employee, Position, Department } = require("../models");

const uploadPath = "./public/uploads/staffs/";

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
    position: person.positionId.name,
    roles,
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

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "" || password === "") {
    return res.json({ success: false, message: "Fill required fields." });
  }

  const email = username;
  return Employee.findOne()
    .or([{ email }, { officialEmail: email }])
    .populate({ path: "positionId", model: Position })
    .exec((err, staff) => {
      if (err)
        return res.json({
          success: false,
          message: `Unsuccessful! ${err.errmsg}`,
        });

      if (!staff || !staff.comparePassword(password)) {
        return res.json({
          success: false,
          message: "Invalid Username or Password",
        });
      }

      const token = createToken(staff);

      return res.json({
        success: true,
        message: "Login Successuful",
        token,
      });
    });
});

router
  .route("/profile")
  .get(checkJwt, (req, res) => {
    Employee.findOne({ _id: req.decoded.user._id })
      .populate({ path: "positionId", select: "name", model: Position })
      .populate({ path: "departmentId", select: "name", model: Department })
      .exec((err, employee) => {
        if (err)
          return res.json({ success: false, message: `Unsuccessful! ${err}` });

        if (!employee)
          return res.send({ success: false, message: "No record found" });

        return res.json({
          success: true,
          message: "Successful!",
          data: employee,
        });
      });
  })
  .put(checkJwt, (req, res) => {
    Employee.findOne({ _id: req.decoded.user._id }, (err, staff) => {
      if (err) return res.json({ success: false, message: "Unsuccessful" });

      if (req.body.name) staff.name = req.body.name;
      if (req.body.address) staff.address = req.body.address;
      if (req.body.mobile) staff.mobile = req.body.mobile;
      if (req.body.telephone) staff.telephone = req.body.telephone;
      if (req.body.sex) staff.sex = req.body.sex;
      if (req.body.dob) staff.dob = req.body.dob;
      if (req.body.professionalSummary)
        staff.professionalSummary = req.body.professionalSummary;
      if (req.body.education) staff.education = req.body.education;
      if (req.body.password) staff.password = req.body.password;
      if (req.body.nationality) staff.nationality = req.body.nationality;
      if (req.body.stateOfOrigin) staff.stateOfOrigin = req.body.stateOfOrigin;
      if (req.body.localGov) staff.localGov = req.body.localGov;
      if (req.body.address_current)
        staff.address_current = req.body.address_current;
      if (req.body.address_permanent)
        staff.address_permanent = req.body.address_permanent;
      if (req.body.nextOfKin) staff.nextOfKin = req.body.nextOfKin;

      return staff.save((saveError, updatedStaff) => {
        if (saveError)
          return res.json({
            success: false,
            message: `Unsuccessful: ${saveError}`,
          });

        const token = createToken(staff);
        return res.json({
          success: true,
          message: "Success updating profile",
          data: updatedStaff,
          token,
        });
      });
    });
  });

router
  .route("/profile/uploads")
  .post(checkJwt, (req, res) => {
    upload(req, res, (err) => {
      if (err) return res.json({ success: false, message: err });

      if (req.file === undefined)
        return res.json({ success: false, message: "No file uploaded" });
      console.log(req.file);
      // save file to db here
      return Employee.findById(req.decoded.user._id, (err, staff) => {
        if (err) return res.json({ success: false, message: err });
        if (!staff)
          return res.json({ success: false, message: "staff not found" });

        staff.documents.push({
          docName: req.body.docName,
          url: `${config.host}/uploads/staffs/${req.file.filename}`,
        });

        return staff.save((err, files) => {
          if (err)
            return res.json({
              success: false,
              message: `Unsuccessful: ${err}`,
            });

          return res.json({
            success: true,
            message: "File successfully added",
            data: files.documents,
          });
        });
      });
    });
  })
  .delete(checkJwt, (req, res) => {
    const document = JSON.parse(req.query.document);

    Employee.findById(req.decoded.user._id, "documents", (err, result) => {
      if (err) return res.json({ success: false, message: err });

      const { documents } = result;
      // get index
      const index = documents.findIndex(
        ({ docName, url }) =>
          docName === document.docName && url === document.url
      );

      if (index === -1) {
        return res.json({ success: true, message: "File does not exist" });
      }

      documents.splice(index, 1);
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
          message: "successful",
          data: savedR.documents,
        });
      });
    });
  });

module.exports = router;
