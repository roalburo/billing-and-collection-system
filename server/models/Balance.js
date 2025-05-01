const mongoose = require('mongoose');
const BalanceSchema = new mongoose.Schema({
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'contracts',
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    credit: {
        type: Number,
        default: 0
    },
    advanceDeposit: {
        type: Number,
        default: 0, // Initial advance payment
        min: [0, 'Advance payment cannot be negative']
    }
});

const BalanceModel = mongoose.model('Balance', BalanceSchema);
module.exports = BalanceModel;
