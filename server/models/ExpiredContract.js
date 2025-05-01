const mongoose = require('mongoose');

const ExpiredContractSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
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
    dateOfContract: Date,
    startDate: Date,
    endDate: Date,
    monthlyRent: String,
    advance: String,
    securityDeposit: String,
});

const ExpiredContractModel = mongoose.model('expiredcontracts', ExpiredContractSchema);
module.exports = ExpiredContractModel;