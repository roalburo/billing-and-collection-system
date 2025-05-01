const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'contracts',
        required: true
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    method: {
        type: String,
        enum: ['Cash', 'Check', 'Advance Deposit'], // Payment methods
        required: true
    },
    referenceNumber: {
        type: String, // Can store receipt number or check number
        default: null // Not required but can be provided for all payment methods
    }
});

const PaymentModel = mongoose.model('payments', PaymentSchema);
module.exports = PaymentModel;
