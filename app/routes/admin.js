const router = require('express').Router();
const { checkJwt, adminAuth } = require('../middleware');
const { Role, Employee, Position, Department } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config');

router.route('/roles')
    .get(checkJwt, adminAuth, (req, res, next) => {
        Role.find({}, (err,roles) => {
            if(err) return  res.json({ success: false, message: ""});

            return  res.json({
                success: true,
                message: 'Successful',
                roles
            });
        })
    })
    .post((req, res) => {
        res.send('Cannot post to this api...');
    })
    .put(checkJwt, adminAuth, (req, res, next) => {
        //location to add to
        const location = req.body.role;
        const userId = req.body.userId;

        Role.findOne({}, (err, result) => {
            if(err) return  res.json({ success: false, message: "Unsuccessful! " + err});
            
            if(result) {

                if(result[`${location}`]){
                    result[`${location}`].push({ userId });

                    result.save((err, updatedResult) => {
                        if(err) return  res.json({success: false, message: "Unsuccessful: " + err});

                        return  res.json({
                            success: true,
                            message: "Successfully added role",
                            updatedResult
                        });
                    })
                }else{
                     res.json({ success: false, message: `Unsuccessful! role does not exist`});
                }
            }
            else {
                let role = new Role();
                role[`${location}`].push({ userId });

                role.save((err, savedRole) => {
                    if(err) return  res.json({success: false, message: "Unsuccessful: " + err});
                    return  res.json({
                        success: true,
                        message: "Successfully added role",
                        savedRole
                    });
                });
            }
        });
    })

    //TO-DO
    //include an API that will show the roles a user is in



    //API to fetch all employee
router.route('/staffs')
    .get(checkJwt, adminAuth, (req, res) => {
        
        Employee.find({}, (err, employee) => {
            if(err) return  res.json({ success: false, message: "Could not fetch employees"});

            if(!employee) return res.json({ success: true, message: "No employee at the moment"});

            return  res.json({ success: true, message: "Successful", data: employee});
        })
    })
    .post(checkJwt, adminAuth, (req, res) => {
        //for adding new staff
        let staff = new Employee();

        if(!req.body.name.firstName && !req.body.name.lastName) return  res.json({ success: false, message: "Name is required..."});

        if(req.body.name) staff.name = req.body.name;
        if(req.body.sex) staff.sex = req.body.sex;
        if(req.body.positionId) staff.positionId = req.body.positionId;
        if(req.body.address) staff.address = req.body.address;
        if(req.body.dob) staff.dob = req.body.dob;
        if(req.body.professionalSummary) staff.professionalSummary = req.body.professionalSummary;
        if(req.body.education) staff.education = req.body.education;
        if(req.body.email) staff.email = req.body.email;
        if(req.body.positionId) staff.positionId = req.body.positionId;
        if(req.body.departmentId) staff.departmentId = req.body.departmentId
        if(req.body.mobile) staff.mobile = req.body.mobile;
        if(req.body.telephone) staff.telephone = req.body.telephone
        if(req.body.nationality) staff.nationality = req.body.nationality;
        if(req.body.address_current) staff.address_current = req.body.address_current;
        if(req.body.address_permanent) staff.address_permanent = req.body.address_permanent;
        if(req.body.title) staff.title = req.body.title;
        if(req.body.education) staff.education = req.body.education;
        
        (req.body.officialEmail) ? 
            staff.officialEmail : staff.officialEmail = `${req.body.name.firstName.toLowerCase()}.${req.body.name.lastName.toLowerCase()}@${config.domain}`;
        
        const prefix = "EMP";
        staff.password = prefix + req.body.name.lastName.toLowerCase();

        staff.save( (err, savedResult) => {
            if(err) return res.json({ success: false, message: "Error: ", err });

            return res.json({success: true, message: "Successful", data: savedResult });
        })
    })

// router.route('/staff')
//     .get(checkJwt, adminAuth, (req, res) => {
//         //should be able to fetch staff info based on:
//         //  1. department, 2. Faculty, 3. Without any params


//     })
//     .post(checkJwt, adminAuth, (req, res, next) => {
//         //for adding new staff
//         let staff = new Employee();

//         if(req.body.name) staff.name = req.body.name;
//         if(req.body.sex) staff.sex = req.body.sex;
//         if(req.body.positionId) staff.positionId = req.body.positionId;
//         if(req.body.address) staff.address = req.body.address;
//         if(req.body.dob) staff.dob = req.body.dob;
//         if(req.body.professionalSummary) staff.professionalSummary = req.body.professionalSummary;
//         if(req.body.education) staff.education = req.body.education;
//         if(req.body.officialEmail) staff.officialEmail = req.body.officialEmail;
//         if(req.body.email) staff.email = req.body.email;
//         if(req.body.positionId) staff.positionId = req.body.positionId;
//         if(req.body.departmentId) staff.departmentId = req.body.departmentId

//         const prefix = "EMP";
//         staff.password = prefix + req.body.name.lastName.toLowerCase();

//         Employee.findOne({ email: req.body.email }, (err, existingStaff) => {
//             if(existingStaff) res.json({
//                 success: false,
//                 message: 'Staff Account with that email already exist'
//             });
//             else{
//                 staff.save((err, result) => {
//                     if(err) return  res.json({ success: false, message: 'Unsuccessful '+ err});
    
//                     res.json({
//                          success: true,
//                          message: 'New Staff successfully added!',
//                          result
//                      });
//                 });
//             }
//         });
//     })
//     .put(checkJwt, adminAuth, (req, res, next) => {
//         //update staff details
//     })  
        
router.route('/staffs/:id')
    .get(checkJwt, adminAuth, (req, res) => {
        //check DB to confirm staff with that ID exists 
        let id = req.params.id;
        
        Employee.findById(id)
            .populate({ path: 'positionId', select: 'name', model: Position})
            .populate({ path: 'departmentId', select: 'name', model: Department})
            .exec((err, employee) => {
                if(err) return  res.json({ success: false, message: "Unsuccessful! "+ err});

                if(!employee) return res.send({success: false, message: "No record found"});

                return  res.json({
                    success: true,
                    message: "Successful!",
                    data: employee
                });
            });
    })
    .put(checkJwt, adminAuth, (req, res, next) => {
        let id = req.params.id;

        Employee.findById(id, (err, employee) => {
            if(err) return res.json({ success: false, message: "Error: ", err});
            if(!employee) return res.json({ success: false, message: "No employee found..." });

            if(req.body.name) employee.name = req.body.name;
            if(req.body.sex) employee.sex = req.body.sex;
            if(req.body.positionId) employee.positionId = req.body.positionId;
            if(req.body.address) employee.address = req.body.address;
            if(req.body.dob) employee.dob = req.body.dob;
            if(req.body.professionalSummary) employee.professionalSummary = req.body.professionalSummary;
            if(req.body.education) employee.education = req.body.education;
            if(req.body.email) employee.email = req.body.email;
            if(req.body.positionId) employee.positionId = req.body.positionId;
            if(req.body.departmentId) employee.departmentId = req.body.departmentId
            if(req.body.mobile) employee.mobile = req.body.mobile;
            if(req.body.telephone) employee.telephone = req.body.telephone
            if(req.body.nationality) employee.nationality = req.body.nationality;
            if(req.body.address_current) employee.address_current = req.body.address_current;
            if(req.body.address_permanent) employee.address_permanent = req.body.address_permanent;
            if(req.body.title) employee.title = req.body.title;
            if(req.body.education) employee.education = req.body.education;
            if(req.body.officialEmail) employee.officialEmail = req.body.officialEmail;

            employee.save( (err, savedEmployee) => {
                if(err) return  res.json({ success: false, message: "Error: ", err });

                return  res.json({ success: true, message: "Success...", data: savedEmployee});
            })
        })
    })

router.route('/positions')
    .get( checkJwt, adminAuth, (req, res, next) => {
        Position.find({}, (err, position) => {
            if(err) return res.json({success: false, message: err.errmsg});

            return res.json({ success: true, message: "success", data: position});
        })
    })
    .post( checkJwt, adminAuth, (req, res, next) => {
        if(!req.body.name) return res.json({success: false, message: "Fill all fields"});

        let position = new Position();
        position.name = req.body.name;

        position.save( (err, result)=> {
            if(err) return res.json({ success: false, message: err});

             res.json({ success: true, message: "Successful!", data: result});
        });
    })

module.exports = router;
