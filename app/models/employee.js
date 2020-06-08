const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const EmployeeSchema = new Schema({
    name: {
        firstName: { type: String, default: "" },
        lastName:  { type: String, default: "" },
        middleName:  { type: String, default: "" }
    },
    mobile:  { type: String, default: "" },
    telephone:  { type: String, default: "" },
    title:  { type: String, default: "" },
    email: { type: String, unique: true, required: true },
    officialEmail: { type: String, unique: true },
    sex:  { type: String, default: "" },
    nationality: String,
    stateOfOrigin: String,
    localGov: String,
    positionId: { type: Schema.Types.ObjectId, ref: 'Position' },
    address_current: {
        line1:  { type: String, default: "" },
        line2:  { type: String, default: "" },
        city:  { type: String, default: "" },
        state:  { type: String, default: "" },
        country:  { type: String, default: "" },
        postalCode:  { type: String, default: "" }
    },
    address_permanent: {
        line1:  { type: String, default: "" },
        line2:  { type: String, default: "" },
        city:  { type: String, default: "" },
        state:  { type: String, default: "" },
        country:  { type: String, default: "" },
        postalCode:  { type: String, default: "" }
    },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    dob: { type: Date },
    professionalSummary:  { type: String, default: "" },
    education:  { 
        primary: { name: String},
        secondary: { name: String },
        tertiary: { name: String }
    },
    documents: { type: Array},
    created: { type: Date, default: Date.now },
    password: { type: String }
})

EmployeeSchema.pre('save', function(){
    return new Promise((resolve, reject) => {
        const user = this;
        
        if(!user.isModified('password')) resolve();

        else bcrypt.hash(user.password, null, null, function(err, result){
                if(err) reject(err);

                user.password = result;
                
                resolve();
            })
    });
})

EmployeeSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = Mongoose.model('Employee', EmployeeSchema);