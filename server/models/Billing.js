const mongoose = require('mongoose');
const BillingSchema = new mongoose.Schema({
    contract: { type: mongoose.Schema.Types.ObjectId, ref: 'contracts', required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    rentAmount: { type: Number, required: true },
    lateFee: { type: Number, default: 0 }, // Default to 0
    totalAmount: { 
        type: Number, 
        required: true,
        validate: {
            validator: function (value) {
                const expectedTotal = this.rentAmount + this.lateFee - this.advancePayment;
                return Math.abs(value - expectedTotal) < 1e-6; // Allow slight tolerance for floating-point errors
            },
            message: 'Total amount must equal rent amount plus any late fee minus advance payment.',
        },
    },
    advancePayment: { type: Number, default: 0 }, // Default to 0
    billDate: { type: Date, required: true },
    dueDate: { 
        type: Date, 
        required: true,
        validate: {
            validator: function (value) {
                return value > this.billDate;
            },
            message: 'Due date must be after bill date.',
        },
    },
    lateFeeApplied: { type: Boolean, default: false },
    lateFeeDate: { type: Date, default: null },
});

// Add indexes for better query performance
BillingSchema.index({ dueDate: 1 });
BillingSchema.index({ lateFeeApplied: 1 });

const BillingModel = mongoose.model('bills', BillingSchema);
module.exports = BillingModel;
