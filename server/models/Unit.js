const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
    unitType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'unittypes',
        required: true
    },
    unitNumber: {
        type: Number,
        required: true
    },
    rentAmount: {
        type: Number,
        required: true
    }
});

const UnitModel = mongoose.model("units", UnitSchema);
module.exports = UnitModel;