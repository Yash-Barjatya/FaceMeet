const mongoose = require("mongoose");

/*** encryption/hashing of password */
const bcrypt = require("bcryptjs")

const newUserSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirm_password: {
        type: String,
        required: true
    },
})

/**middleware for hashing password ... */
newUserSchema.pre("save", async function (next) {//pre is a method of middleware that takes two arguments one the method before which you want to do the work here 'save' and 2nd the work == function
    if (this.isModified("password")) { 
        // first time registration or if password is modified only then password will be hashed
        // console.log(`user password = ${this.password}  before hashing`)
        this.password = await bcrypt.hash(this.password, 10);
        // console.log(`user password = ${this.password}  after hashing`)

        /* not we required confirm password only to check if user knows what he/she is setting as password 
            once that is done then we no longer need confirm password data*/
        this.confirm_password = undefined;
    }
    next();// now save method will be called

})
// collection name should be singular and first letter should be capital
const Register = new mongoose.model("Register", newUserSchema);
module.exports = Register;