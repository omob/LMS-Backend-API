const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const randomatic = require('randomatic');

const StudentSchema = new Schema({
    name: {
        firstName: String,
        lastName: String,
        middleName: String
    },
    title: String,
    email: { type: String, unique: true },
    mobile: String,
    telephone: String,
    sex: String,
    nationality: String,
    stateOfOrigin: String,
    localGov: String,
    address_current: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    address_permanent: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    dob: { type: Date },
    matricNo: { type: String, unique: true },
    registrationNo: { type: String, unique: true},
    programme: { type: Schema.Types.ObjectId, ref: 'Programme' },
    programmeType: { type: Schema.Types.ObjectId }, //fulltime or parttime
    sponsor: {
        firstName: { type: String, default: ""},
        lastName: { type: String, default: ""}, 
        email: { type: String, default: ""},
        phone: { type: String, default: ""}
    },
    nextOfKin: {
        firstName: { type: String, default: ""},
        lastName: { type: String, default: ""}, 
        email: { type: String, default: ""},
        phone: { type: String, default: ""},
        relationship: { type: String, default: ""}
    },
    password: { type: String },
    education: {
        primary: { name: String},
        secondary: { name: String },
        tertiary: { name: String }
    },
    professionalProfile: { name: String },
    documents: { type: Array },
    created: { type: Date, default: Date.now }
});

StudentSchema.pre('save', function(){
    return new Promise((resolve, reject) => {
        var user = this;
        // console.log('Im in presave. User: ', user);
        if(!user.isModified('password')) resolve();

        if(user.isModified('password')){
            bcrypt.hash(user.password, null, null, function(err, hash){
                if(err) reject(err);

                user.password = hash;

                resolve();
            });
        }
        //fix data on regNo & Matric
        user.registrationNo = randomatic('A0', 10);
        user.matricNo = randomatic('0', 9);
    });
});

StudentSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = Mongoose.model('Student', StudentSchema);