const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    notificationSettings: {
        billingAlerts: { type: Boolean, default: true },
        maintenanceUpdates: { type: Boolean, default: true },
        contractRenewals: { type: Boolean, default: true }
    }
});

const EmployeeModel = mongoose.model("employees", EmployeeSchema);
module.exports = EmployeeModel;