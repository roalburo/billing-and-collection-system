const mongoose = require('mongoose')

const UnitTypeSchema = new mongoose.Schema({
    unitType: String
})

const UnitTypeModel = mongoose.model("unittypes", UnitTypeSchema)
module.exports = UnitTypeModel