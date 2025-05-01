const mongoose = require('mongoose');

const MaintenanceBalSchema = new mongoose.Schema({
    maintenance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'maintenances',
        required: true
    },
    amtPaid: {
        type: Number,
        required: true
    },
    datePaid: {
        type: Date,
        required: true
    }
});

const MaintenanceBalModel = mongoose.model('maintenancebals', MaintenanceBalSchema);
module.exports = MaintenanceBalModel;