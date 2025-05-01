const mongoose = require('mongoose')
const ContractSchema = new mongoose.Schema({
    unit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
        required: true
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    advanceDeposit: { type: Number, default: 0 }, // Include advance field

    dateOfContract: Date,
    startDate: Date,
    endDate: Date,
    monthlyRent: String,
    securityDeposit: Number,
});
const ContractModel = mongoose.model("contracts", ContractSchema)
module.exports = ContractModel