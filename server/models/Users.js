const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    email: String,
    contactNumber: Number,
    currentAddress: String,
    emergencyName: String,
    emergencyNumber: Number
})

const UserModel = mongoose.model("users", UserSchema)
module.exports = UserModel