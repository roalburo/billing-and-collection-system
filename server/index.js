require('dotenv').config();
const express = require('express')
const jwt = require('jsonwebtoken');
const schedule = require('node-schedule');
const mongoose = require('mongoose')
const cors = require('cors')
const UserModel = require('./models/Users')
const UnitModel = require('./models/Unit')
const ContractModel = require('./models/Contract')
const PaymentModel = require('./models/Payment')
const BillingModel = require('./models/Billing')
const BalanceModel = require('./models/Balance')
const UnitTypeModel = require('./models/UnitType')
const MaintenanceModel = require('./models/Maintenance')
const MaintenanceBalModel = require('./models/MaintenanceBal')
const EmployeeModel = require('./models/Employee')
const ExpiredContractModel = require('./models/ExpiredContract')
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb://127.0.0.1:27017/crud")
app.get('/generateInvoice/:billingId', async (req, res) => {
    const { billingId } = req.params;

    app.get('/getOverdueRent', async (req, res) => {
        try {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0); // Remove time part
    
            // Find all bills where the due date is past the current date
            const overdueBills = await BillingModel.find({
                dueDate: { $lt: currentDate },
            });
    
            // Calculate the total overdue amount and the number of overdue contracts
            const totalOverdueAmount = overdueBills.reduce(
                (sum, bill) => sum + bill.totalAmount,
                0
            );
            const uniqueContracts = new Set(overdueBills.map((bill) => bill.contract));
    
            res.json({
    
                totalOverdueAmount,
                contractCount: uniqueContracts.size,
            });
        } catch (err) {
            console.error('Error fetching overdue rent:', err);
            res.status(500).json({ error: 'Failed to fetch overdue rent' });
        }
    });
    
    
    app.get('/getContractsDueThisMonth', async (req, res) => {
    
        try {
    
            const startOfMonth = new Date();
    
            startOfMonth.setDate(1); // First day of the current month
    
            startOfMonth.setHours(0, 0, 0, 0);
    
    
    
            const endOfMonth = new Date(startOfMonth);
    
            endOfMonth.setMonth(endOfMonth.getMonth() + 1); // First day of the next month
    
            endOfMonth.setHours(0, 0, 0, 0);
    
    
    
            // Query bills due this month and count unique contracts
    
            const contractsDueThisMonth = await BillingModel.find({
    
                dueDate: { $gte: startOfMonth, $lt: endOfMonth }
    
            }).distinct('contract'); // Get unique contracts
    
    
    
            res.json({ contractCount: contractsDueThisMonth.length });
    
        } catch (err) {
    
            console.error("Error fetching contracts due this month:", err);
    
            res.status(500).json({ error: "Failed to fetch contracts due this month" });
    
        }
    
    });
    
    
    
    
    
    app.get('/getBillsDueThisMonth', async (req, res) => {
    
        try {
    
            const startOfMonth = new Date();
    
            startOfMonth.setDate(1); // First day of the month
    
            startOfMonth.setHours(0, 0, 0, 0);
    
    
    
            const endOfMonth = new Date(startOfMonth);
    
            endOfMonth.setMonth(endOfMonth.getMonth() + 1); // First day of next month
    
            endOfMonth.setHours(0, 0, 0, 0);
    
    
    
            // Fetch bills with dueDate within the current month
    
            const bills = await BillingModel.find({
    
                dueDate: { $gte: startOfMonth, $lt: endOfMonth }
    
            });
    
    
    
            // Sum up the totalAmount of all bills within the current month
    
            const totalDueThisMonth = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    
    
    
            console.log("Bills due this month:", bills); // Debug log
    
            res.json({ totalDueThisMonth });
    
        } catch (err) {
    
            console.error("Error fetching bills due this month:", err);
    
            res.status(500).json({ error: "Failed to fetch bills due this month" });
    
        }
    
    });
    
    
    
    app.get('/getPaymentsThisMonth', async (req, res) => {
    
        try {
    
            // Get the first and last day of the current month
    
            const startOfMonth = new Date();
    
            startOfMonth.setDate(1); // First day of the month
    
            startOfMonth.setHours(0, 0, 0, 0); // Reset to midnight
    
    
    
            const endOfMonth = new Date(startOfMonth);
    
            endOfMonth.setMonth(endOfMonth.getMonth() + 1); // Move to next month
    
            endOfMonth.setHours(0, 0, 0, 0); // Reset to midnight
    
    
    
            // Fetch payments made in the current month
    
            const payments = await PaymentModel.find({
    
                date: { $gte: startOfMonth, $lt: endOfMonth }
    
            });
    
    
    
            // Sum up the amounts
    
            const totalAmtPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    
    
            // Log for debugging
    
            console.log("Payments this month:", payments);
    
            console.log("Total amount received this month:", totalAmtPaid);
    
    
    
            // Return the total amount received
    
            res.json({ totalAmtPaid });
    
        } catch (err) {
    
            console.error("Error fetching payments this month:", err);
    
            res.status(500).json({ error: "Failed to fetch payments" });
    
        }
    
    });
    
    
    
    
    
    app.get('/maintenancePaidTotal', async (req, res) => {
    
        try {
    
            const now = new Date();
    
            const currentMonth = now.getMonth(); // 0-indexed (0 = January)
    
            const currentYear = now.getFullYear();
    
    
    
            // Log current date, month, and year
    
            console.log('Current Date:', now);
    
            console.log('Current Month (1-indexed):', currentMonth + 1);
    
            console.log('Current Year:', currentYear);
    
    
    
    
    
    
    
            // Log matching records
    
            const matchingRecords = await MaintenanceBalModel.find({
    
                $expr: {
    
                    $and: [
    
                        { $eq: [{ $month: "$datePaid" }, currentMonth + 1] }, // 1-indexed
    
                        { $eq: [{ $year: "$datePaid" }, currentYear] }
    
                    ]
    
                }
    
            });
    
            console.log('Matching Records:', matchingRecords);
    
    
    
            // Aggregate total paid
    
            const totalPaid = await MaintenanceBalModel.aggregate([
    
                {
    
                    $match: {
    
                        $expr: {
    
                            $and: [
    
                                { $eq: [{ $month: "$datePaid" }, currentMonth + 1] },
    
                                { $eq: [{ $year: "$datePaid" }, currentYear] }
    
                            ]
    
                        }
    
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmtPaid: { $sum: "$amtPaid" },
                    }
                }
            ]);
    

            // Log aggregation result
            console.log('Aggregation Result:', totalPaid);
            const total = totalPaid.length > 0 ? totalPaid[0].totalAmtPaid : 0;
            res.json({ totalAmtPaid: total });
        } catch (err) {
            console.error('Error fetching maintenance paid total:', err);
            res.status(500).json({ error: 'Failed to fetch maintenance paid total' });
        }    
    });

    app.get('/maintenanceDetails', async (req, res) => {
        try {
            const maintenanceRecords = await MaintenanceModel.find({})
                .populate({
                    path: 'unit',
                    populate: {
                        path: 'unitType', // Populate `unitType` field in `units`
                        select: 'unitType', // Only fetch the `unitType` field
                    },
                    select: 'unitType unitNumber', // Fetch `unitType` and `unitNumber` from `units`
                })
                .select('unit maintenanceType dueDate cost'); // Fetch specific fields from Maintenance
            console.log("Populated Maintenance Records:", maintenanceRecords); // Debugging
            res.json(maintenanceRecords);
        } catch (err) {
            console.error('Error fetching maintenance details:', err);
            res.status(500).json({ error: 'Failed to fetch maintenance details' });
        }
    });

    

    app.get('/billing', (req, res) => {
        BillingModel.find({}, 'tenant dueDate totalAmount') // Fetch only specific fields
            .populate('tenant', 'firstName lastName') // Populate tenant details (firstName and lastName only)
            .then(bills => res.json(bills)) // Send the filtered data as response
            .catch(err => {
                console.error('Error fetching billing data:', err);
                res.status(500).json({ error: 'Failed to fetch billing data' });
            });
    });
    
    try {
        // Fetch billing details, populate tenant and unit
        const billing = await BillingModel.findById(billingId)
            .populate({
                path: 'contract',
                populate: [
                    { path: 'tenant', model: 'users' },
                    { path: 'unit', model: 'units', populate: { path: 'unitType', model: 'unittypes' } }
                ]
            });

        if (!billing) {
            return res.status(404).json({ message: 'Billing record not found' });
        }

        const tenant = billing.contract.tenant;
        const unit = billing.contract.unit;

        // Calculate adjusted total based on overpayments
        const overpayment = billing.overpayment || 0; // Assume 0 if no overpayment field exists
        const adjustedTotal = billing.totalAmount - overpayment;

        // Create a PDF document
        const doc = new PDFDocument();

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice-${billingId}.pdf`);

        // Pipe PDF stream to response
        doc.pipe(res);

        // Use Helvetica font
        doc.font('Helvetica');

        // Add header with company information
        doc.fontSize(16).text('Agreville Realty Corporation', { align: 'center' });
        doc.fontSize(12).text('Contact: JM Sumali Dalingan', { align: 'center' });
        doc.text('Contact Number: 09501036266', { align: 'center' });
        doc.moveDown(2);

        // Add invoice title
        doc.fontSize(16).text('Invoice Statement', { align: 'center' });
        doc.moveDown(2);

        // Add tenant, unit, and due date details
        doc.fontSize(12).text(`Invoice Number: INV-${billingId}`);
        doc.text(`Billing ID: ${billingId}`);
        doc.moveDown(2);

        // Add invoice metadata
        doc.text(`Tenant Name: ${tenant.firstName} ${tenant.lastName}`);
        doc.text(`Unit Occupied: ${unit.unitType.unitType} - ${unit.unitNumber}`);
        doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`);
        doc.text(`Due Date: ${new Date(billing.dueDate).toLocaleDateString()}`);        
        doc.moveDown(2);

        // Draw table for the bill breakdown
        const tableTop = doc.y;
        const column1X = 50;
        const column2X = 300;
        const rowHeight = 20;

        // Draw table headers
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Description', column1X, tableTop);
        doc.text('Amount (PHP)', column2X, tableTop);

        // Draw table rows
        doc.font('Helvetica').fontSize(12);
        let y = tableTop + rowHeight;

        const addRow = (description, amount) => {
            doc.text(description, column1X, y);
            doc.text(amount, column2X, y);
            y += rowHeight;
        };

        // Populate table rows with data
        addRow('Rent Amount', `PHP${billing.rentAmount.toFixed(2)}`);
        addRow('Late Fee (if applicable)', `PHP${billing.lateFee ? billing.lateFee.toFixed(2) : '0.00'}`);
        addRow('Overpayment Deduction', `-PHP${overpayment.toFixed(2)}`);

        // Add total amount row with emphasis
        doc.moveDown(1);
        doc.font('Helvetica-Bold').fontSize(14);
        doc.text('Total Amount', column1X, y);
        doc.text(`PHP${adjustedTotal.toFixed(2)}`, column2X, y);

        // Move the Y position after the table
        y += rowHeight * 2;

        // Footer with notes
        y += rowHeight * 2;
        doc.text('Notes:', column1X, y, { underline: true });
        y += rowHeight;
        doc.text('1. Please retain this invoice for your records.', column1X, y);
        y += rowHeight;
        doc.text('2. Late payments will incur additional fees.', column1X, y);

        // Thank you message
        y += rowHeight * 2;
        doc.fontSize(12).text('Thank you for choosing Agreville Realty Corporation!', { align: 'center' });

        // Finalize the document
        doc.end();

        console.log(`Invoice generated for billing ID: ${billingId}`);
    } catch (err) {
        console.error('Error generating invoice:', err);
        res.status(500).json({ message: 'Error generating invoice', error: err });
    }
});



app.get('/users', (req, res) => {
    UserModel.find({})
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

app.get('/unit', (req, res) => {
    UnitModel.find({})
    .then(unit => res.json(unit))
    .catch(err => res.json(err))
})

app.get('/unittype', (req, res) => {
    UnitTypeModel.find({})
    .then(unittype => res.json(unittype))
    .catch(err => res.json(err))
})

app.get('/contract', (req, res) => {
    ContractModel.find({})
    .then(contract => res.json(contract))
    .catch(err => res.json(err))
})

app.get('/expiredcontract', (req, res) => {
    ExpiredContractModel.find({})
    .then(contract => res.json(contract))
    .catch(err => res.json(err))
})

app.get('/balance', (req, res) => {
    BalanceModel.find({})
    .then(bal => res.json(bal))
    .catch(err => res.json(err))
})

app.get('/maintenance', (req, res) => {
    MaintenanceModel.find({})
    .then(rec => res.json(rec))
    .catch(err => res.json(err))
})

app.get('/maintenanceBal', (req, res) => {
    MaintenanceBalModel.find({})
    .then(bal => res.json(bal))
    .catch(err => res.json(err))
})

app.get('/getUser/:id', (req, res) => {
    const id = req.params.id;
    UserModel.findById({_id:id})
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

app.get('/getUnit/:id', (req, res) => {
    const id = req.params.id;
    UnitModel.findById({_id:id})
    .then(unit => res.json(unit))
    .catch(err => res.json(err))
})

app.get('/getUnitType/:id', (req, res) => {
    const id = req.params.id;
    UnitTypeModel.findById({_id:id})
    .then(unittype => res.json(unittype))
    .catch(err => res.json(err))
})

app.get('/getContract/:id', (req, res) => {
    const { id } = req.params;

    ContractModel.findById(id)
        .populate('tenant')
        .populate('unit')
        .then(contract => {
            if (!contract) {
                return res.status(404).json({ message: 'Contract not found' });
            }
            res.json(contract);
        })
        .catch(err => res.status(500).json({ message: 'Server error', error: err }));
});


app.get('/getExpiredContract/:id', (req, res) => {
    const id = req.params.id;
    ExpiredContractModel.findById({_id:id})
    .then(contract => res.json(contract))
    .catch(err => res.json(err))
})

app.get('/getPayment/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const payments = await PaymentModel.find({ contract: id });
        
        if (!payments || payments.length === 0) {
            return res.status(404).json({ message: 'No payments found for this contract.' });
        }

        res.status(200).json(payments);
    } catch (err) {
        console.error('Error fetching payment logs:', err);
        res.status(500).json({ error: 'An error occurred while retrieving payments.' });
    }
});


app.get('/getBilling/:id', (req, res) => {
    const id = req.params.id;
    BillingModel.find({contract:id})
    .then(bill => res.json(bill))
    .catch(err => res.json(err))
})

app.get('/getBalance/:id', async (req, res) => {
    try {
        const balance = await BalanceModel.findOne({ contract: req.params.id });
        console.log('Balance Retrieved for Contract:', req.params.id, balance);
        res.json(balance || { balance: 0 }); // Default to 0 if no balance exists
    } catch (err) {
        console.error('Error fetching balance:', err);
        res.status(500).json({ message: 'Error fetching balance', error: err });
    }
});

app.get('/getMaintenance/:id', (req, res) => {
    const id = req.params.id;
    MaintenanceModel.findById({_id:id})
    .then(m => res.json(m))
    .catch(err => res.json(err))
})

app.get('/getAccount/:id', (req, res) => {
    const id = req.params.id;
    EmployeeModel.findOne({ _id: id })
      .then(acc => {
        if (!acc) {
          return res.status(404).json({ message: 'Account not found' });
        }
        res.json(acc);
      })
      .catch(err => res.status(500).json({ message: 'Server error', error: err }));
});

app.get('/getAdvanceDeposit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const contract = await ContractModel.findById(id);
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found' });
        }
        res.status(200).json({ advanceDeposit: contract.advanceDeposit });
    } catch (error) {
        console.error('Error fetching advance deposit:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});


app.put('/updateBalance/:id', async (req, res) => {
    const { balance } = req.body;

    try {
        const updatedBalance = await BalanceModel.findOneAndUpdate(
            { contract: req.params.id },
            { balance: parseFloat(balance) },
            { new: true, upsert: true } // Create if it doesn't exist
        );

        res.status(200).json({ message: "Balance updated successfully.", balance: updatedBalance });
    } catch (error) {
        console.error('Error updating balance:', error);
        res.status(500).json({ message: 'Error updating balance', error });
    }
});

  
app.put('/updateUser/:id', (req, res) => {
    const id = req.params.id;
    UserModel.findByIdAndUpdate({_id:id}, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        email: req.body.email,
        contactNumber: req.body.contactNumber,
        currentAddress: req.body.currentAddress,
        emergencyName: req.body.emergencyName,
        emergencyNumber: req.body.emergencyNumber})
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

app.put('/updateUnit/:id', (req, res) => {
    const id = req.params.id;
    UnitModel.findByIdAndUpdate({_id:id}, {
        unitType: req.body.unitType,
        unitNumber: req.body.unitNumber,
        rentAmount: req.body.rentAmount})
    .then(units => res.json(units))
    .catch(err => res.json(err))
})

app.put('/updateAccount/:id', (req, res) => {
    const id = req.params.id;
    EmployeeModel.findByIdAndUpdate({_id:id}, {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password})
    .then(acc => res.json(acc))
    .catch(err => res.json(err))
})

app.put('/updateMaintenance/:id', (req, res) => {
    const id = req.params.id;
    MaintenanceModel.findByIdAndUpdate({_id:id}, {
        unit: req.body.unit,
        maintenanceType: req.body.maintenanceType,
        dateStart: req.body.dateStart,
        dateEnd: req.body.dateEnd,
        cost: req.body.cost,
        dueDate: req.body.dueDate,
        remarks: req.body.remarks,
        status: req.body.status})
    .then(m => res.json(m))
    .catch(err => res.json(err))
})

app.put('/updateAdvanceDeposit/:contractId', async (req, res) => {
    const { contractId } = req.params;
    const { advanceDeposit } = req.body;

    try {
        const contract = await ContractModel.findById(contractId);
        if (!contract) {
            return res.status(404).json({ message: "Contract not found" });
        }

        // Ensure precise subtraction
        const updatedAdvanceDeposit = Math.max(0, parseFloat((contract.advanceDeposit - advanceDeposit).toFixed(2)));

        if (updatedAdvanceDeposit < 0) {
            return res.status(400).json({ message: "Insufficient advance deposit balance." });
        }

        contract.advanceDeposit = updatedAdvanceDeposit;
        await contract.save();

        res.status(200).json({ message: "Advance deposit updated successfully.", advanceDeposit: contract.advanceDeposit });
    } catch (err) {
        console.error("Error updating advance deposit:", err);
        res.status(500).json({ message: "Failed to update advance deposit", error: err });
    }
});


app.delete('/deleteUser/:id', (req, res) => {
    const id = req.params.id;
    UserModel.findByIdAndDelete({_id:id})
    .then(res => res.json(res))
    .catch(err => res.json(err))
})

app.delete('/deleteUnit/:id', (req, res) => {
    const id = req.params.id;
    UnitModel.findByIdAndDelete({_id:id})
    .then(res => res.json(res))
    .catch(err => res.json(err))
})

app.delete('/deleteUnitType/:id', (req, res) => {
    const id = req.params.id;
    UnitTypeModel.findByIdAndDelete({_id:id})
    .then(res => res.json(res))
    .catch(err => res.json(err))
})

app.delete('/deleteMaintenance/:id', (req, res) => {
    const id = req.params.id;
    MaintenanceModel.findByIdAndDelete({_id:id})
    .then(res => res.json(res))
    .catch(err => res.json(err))
})

app.delete('/deleteContract/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const contract = await ContractModel.findById(id);
        if (!contract) {
            return res.status(404).json({ error: "Contract not found" });
        }

        await ExpiredContractModel.create({
            _id: contract._id,
            unit: contract.unit,
            tenant: contract.tenant,
            dateOfContract: contract.dateOfContract,
            startDate: contract.startDate,
            endDate: contract.endDate,
            monthlyRent: contract.monthlyRent,
            advanceDeposit: contract.advanceDeposit,
            securityDeposit: contract.securityDeposit,
        });

        const endDate = new Date(contract.endDate);
        const currentDate = new Date();
        
        let remainingMonths = 0;
        if (currentDate < endDate) {
            remainingMonths = (endDate.getFullYear() - currentDate.getFullYear()) * 12 + (endDate.getMonth() - currentDate.getMonth());
            remainingMonths = Math.max(remainingMonths, 0);
        }

        const additionalCharge = remainingMonths * contract.monthlyRent;

        let currentBalance = await BalanceModel.findOne({ contract: id });
        if (currentBalance) {
            currentBalance.balance += additionalCharge;
            await currentBalance.save();
        } else {
            await BalanceModel.create({
                contract: id,
                balance: additionalCharge
            });
        }

        await ContractModel.findByIdAndDelete(id);

        res.json({ message: "Contract moved to expired contracts and deleted successfully", additionalCharge });
    } catch (err) {
        console.error('Error ending the contract:', err);
        res.status(500).json({ error: "Failed to end the contract" });
    }
});

app.delete('/deleteAccount/:id', (req, res) => {
    const id = req.params.id;
    EmployeeModel.findByIdAndDelete({_id:id})
    .then(res => res.json(res))
    .catch(err => res.json(err))
})

// Scheduled billing logic
app.post('/refreshBilling', async (req, res) => {
    try {
        const today = new Date();

        // Fetch all active contracts
        const contracts = await ContractModel.find({});

        const updates = [];

        for (const contract of contracts) {
            // Get the latest bill for this contract
            const latestBill = await BillingModel.findOne({ contract: contract._id })
                .sort({ billDate: -1 }); // Sort by latest bill date

            const nextBillingDate = latestBill 
                ? new Date(latestBill.billDate) // Use the last bill date
                : new Date(contract.startDate); // Use contract start date if no bill exists

            // Increment the month for the next billing cycle
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

            // Ensure bills are only generated for due months
            if (nextBillingDate <= today) {
                // Check if a bill for this month has already been created
                const existingBill = await BillingModel.findOne({
                    contract: contract._id,
                    billDate: {
                        $gte: new Date(nextBillingDate.getFullYear(), nextBillingDate.getMonth(), 1), // Start of billing month
                        $lt: new Date(nextBillingDate.getFullYear(), nextBillingDate.getMonth() + 1, 1), // Start of next month
                    },
                });

                if (!existingBill) {
                    // Generate a new bill
                    const rentAmount = parseFloat(contract.monthlyRent);
                    const dueDate = new Date(nextBillingDate);
                    dueDate.setDate(dueDate.getDate() + 7); // Set due date 7 days after billing date

                    const newBill = {
                        contract: contract._id,
                        tenant: contract.tenant,
                        rentAmount,
                        totalAmount: rentAmount,
                        billDate: nextBillingDate,
                        dueDate: dueDate,
                    };

                    await BillingModel.create(newBill);

                    // Update the balance for this contract
                    const currentBalance = await BalanceModel.findOne({ contract: contract._id });
                    if (currentBalance) {
                        currentBalance.balance += rentAmount;
                        await currentBalance.save();
                    } else {
                        await BalanceModel.create({ contract: contract._id, balance: rentAmount });
                    }

                    updates.push({ contractId: contract._id, action: 'Bill Created', billDate: nextBillingDate });
                }
            }
        }

        // Apply late fees to overdue bills
      // Apply late fees to overdue bills
const overdueBills = await BillingModel.find({
    dueDate: { $lt: today }, // Past due date
    totalAmount: { $gt: 0 }, // Unpaid bills
    lateFeeApplied: false,  // Late fee not already applied
});

for (const bill of overdueBills) {
    const currentBalance = await BalanceModel.findOne({ contract: bill.contract });

    // Check if the bill's balance is positive and overdue within the late fee period
    if (currentBalance && currentBalance.balance > 0) {
        const lateFeeStartDate = new Date(bill.dueDate);
        lateFeeStartDate.setDate(lateFeeStartDate.getDate() + 7); // 7 days grace period

        if (today > bill.dueDate && today <= lateFeeStartDate) {
            const lateFee = currentBalance.balance * 0.2; // 20% late fee

            // Apply late fee to the bill
            bill.totalAmount += lateFee;
            bill.lateFee = lateFee;
            bill.lateFeeApplied = true;
            bill.lateFeeDate = today;

            // Update balance
            currentBalance.balance += lateFee;

            await bill.save();
            await currentBalance.save();

            updates.push({ billId: bill._id, action: 'Late Fee Applied', lateFee });
        } else {
            // Late fee not applicable outside the 7-day grace period
            updates.push({ billId: bill._id, action: 'Late Fee Skipped', reason: 'Outside grace period' });
        }
    } else {
        // Skip late fee for negative or zero balances
        updates.push({ billId: bill._id, action: 'Late Fee Skipped', reason: 'Negative or zero balance' });
    }
}
           

        res.status(200).json({ message: 'Billing refreshed successfully', updates });
    } catch (err) {
        console.error('Error refreshing billing:', err);
        res.status(500).json({ message: 'Error refreshing billing', error: err });
    }
});


app.post("/recordAdvancePayment", async (req, res) => {
    const { contract, tenant, amount } = req.body;

    try {
        let balanceRecord = await BalanceModel.findOne({ contract });

        if (!balanceRecord) {
            // Create a new balance record if none exists
            balanceRecord = await BalanceModel.create({ contract, balance: 0, credit: amount });
        } else {
            // Update the credit balance
            balanceRecord.credit += amount;
            await balanceRecord.save();
        }

        res.status(200).json({ message: "Advance payment recorded successfully.", balanceRecord });
    } catch (err) {
        console.error("Error recording advance payment:", err);
        res.status(500).json({ message: "Failed to record advance payment", error: err });
    }
});


app.post("/createUser", (req, res) => {
    UserModel.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

app.post("/createUnit", (req, res) => {
    UnitModel.create(req.body)
    .then(unit => res.json(unit))
    .catch(err => res.json(err))
})

app.post("/createUnitType", (req, res) => {
    UnitTypeModel.create(req.body)
    .then(unittype => res.json(unittype))
    .catch(err => res.json(err))
})

app.post("/createContract", (req, res) => {
    const {
        unit,
        tenant,
        advanceDeposit, // Ensure this field is received
        dateOfContract,
        startDate,
        endDate,
        monthlyRent,
        securityDeposit
    } = req.body;

    ContractModel.create({
        unit,
        tenant,
        advanceDeposit: advanceDeposit || 0, // Set default if not provided
        dateOfContract,
        startDate,
        endDate,
        monthlyRent,
        securityDeposit
    })
    .then(contract => res.json(contract))
    .catch(err => res.status(500).json({ message: "Failed to create contract", error: err }));
});


app.post("/createExpiredContract", (req, res) => {
    ExpiredContractModel.create(req.body)
    .then(contract => res.json(contract))
    .catch(err => res.json(err))
})

app.post("/createPayment", async (req, res) => {
    const { contract, tenant, amount, date, method, referenceNumber } = req.body; // Include referenceNumber

    try {
        const newPayment = await PaymentModel.create({
            contract,
            tenant,
            amount,
            date,
            method,
            referenceNumber: referenceNumber || null, // Save referenceNumber, default to null if not provided
        });
        res.status(201).json({ message: "Payment recorded successfully.", payment: newPayment });
    } catch (err) {
        console.error("Error creating payment log:", err);
        res.status(500).json({ message: "Failed to record payment", error: err });
    }
});


app.post("/createBill", (req, res) => {
    BillingModel.create(req.body)
    .then(bill => res.json(bill))
    .catch(err => res.json(err))
})

app.post("/createBalance", async (req, res) => {
    const { contract, balance } = req.body;

    try {
        // Check if a balance already exists for the contract
        const existingBalance = await BalanceModel.findOne({ contract });
        if (existingBalance) {
            return res.status(400).json({ message: "Balance already exists for this contract." });
        }

        // Create new balance
        const newBalance = await BalanceModel.create({ contract, balance });
        res.status(201).json(newBalance);
    } catch (err) {
        console.error("Error creating balance:", err);
        res.status(500).json({ message: "Failed to create balance", error: err });
    }
});


app.post("/createMaintenance", (req, res) => {
    MaintenanceModel.create(req.body)
    .then(m => res.json(m))
    .catch(err => res.json(err))
})

app.post("/maintenanceBal", (req, res) => {
    MaintenanceBalModel.create(req.body)
    .then(m => res.json(m))
    .catch(err => res.json(err))
})

app.get('/unitExists/:unitType', async (req, res) => {
    try {
        const { unitType } = req.params;
        const unit = await UnitTypeModel.findOne({ unitType });
        if (unit) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
})

app.get('/unitExists/:unitNumber/:unitType', async (req, res) => {
    try {
        const { unitNumber, unitType } = req.params;
        const unit = await UnitModel.findOne({ unitNumber, unitType });
        if (unit) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
})

app.post('/register', (req, res) => {
    EmployeeModel.create(req.body)
    .then(employees => res.json(employees))
    .catch(err => res.json(err))
})

app.post('/login', (req, res) => {
    const { loginInput, password } = req.body;
    EmployeeModel.findOne({ $or: [{ email: loginInput }, { name: loginInput }] })
    .then(user => {
        if(user) {
            if(user.password === password) {
                const token = jwt.sign(
                    { id: user._id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );
                res.json({ message: "Success", token });
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            res.status(404).json({ message: "No record found" });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    });
});

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Access token required" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token" });
        
        req.user = user;
        next();
    });
};

app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: "Welcome to the dashboard", user: req.user });
});

app.listen(3001, () => {
    console.log("Server is Running")
})

// For simulation: Tests every minute.
// schedule.scheduleJob('*/1 * * * *', async () => { // Runs every minute for testing
//     console.log('Testing scheduled billing job...');
    
//     const today = new Date(); // Define the current date
//     console.log('Today:', today);

// Schedule a daily job to generate bills
// schedule.scheduleJob('0 0 * * *', async () => { // Runs daily at midnight
//     console.log('Running scheduled billing job...');
    
//     const today = new Date(); // Define the current date
//     console.log('Today (Full Date):', today);
//     console.log('Today (Date):', today.getDate());
// try {
//     // Fetch all contracts
//     const contracts = await ContractModel.find({});
//     console.log('Contracts found:', contracts.length);

//     if (contracts.length === 0) {
//         console.log('No contracts found. Ensure your database has contracts.');
//         return; // Exit early if no contracts
//     }

//     for (const contract of contracts) {
//         const startDate = new Date(contract.startDate);
//         const startDay = startDate.getDate(); // Get contract's start day (DD)

//         console.log('Processing contract ID:', contract._id);
//         console.log('Contract Start Date:', startDate);
//         console.log('Start Day (DD):', startDay);

//         // Generate bills if it's the due date
//         if (today.getDate() === startDay) {
//             console.log(`Match found! Generating bill for contract ID: ${contract._id}`);

//             // Check if a bill already exists for the same contract in the same month
//             const existingBill = await BillingModel.findOne({
//                 contract: contract._id,
//                 billDate: {
//                     $gte: new Date(today.getFullYear(), today.getMonth(), 1), // Start of the month
//                     $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1), // Start of next month
//                 },
//             });

//             if (!existingBill) {
//                 console.log(`No existing bill found for contract ID: ${contract._id}`);

//                 const currentBalance = await BalanceModel.findOne({ contract: contract._id });
//                 const previousBalance = currentBalance ? currentBalance.balance : 0;

//                 const totalAmount = parseFloat(previousBalance) + parseFloat(contract.monthlyRent);

//                 // Set due date 7 days from the bill creation date
//                 const dueDate = new Date(today);
//                 dueDate.setDate(dueDate.getDate() + 7);

//                 // Create new bill
//                 const newBill = {
//                     contract: contract._id,
//                     tenant: contract.tenant,
//                     rentAmount: parseFloat(contract.monthlyRent),
//                     totalAmount: totalAmount,
//                     billDate: today,
//                     dueDate: dueDate,
//                 };

//                 await BillingModel.create(newBill);

//                 // Update or create balance
//                 if (currentBalance) {
//                     currentBalance.balance = totalAmount;
//                     await currentBalance.save();
//                 } else {
//                     await BalanceModel.create({ contract: contract._id, balance: totalAmount });
//                 }

//                 console.log(`Bill generated for contract ID: ${contract._id}`);
//             } else {
//                 console.log(`Bill already exists for contract ID: ${contract._id} this month.`);
//             }
//         } else {
//             console.log(`No match. Today is ${today.getDate()}, start day is ${startDay}`);
//         }
//     }

//     // Apply penalties for overdue bills
// const overdueBills = await BillingModel.find({
//     dueDate: { $lt: today }, // Bills past due date
//     totalAmount: { $gt: 0 }, // Unpaid bills
//     lateFeeApplied: false, // Late fee not applied yet
// });

// console.log(`Overdue Bills Found: ${overdueBills.length}`);

// for (const bill of overdueBills) {
//     const currentBalance = await BalanceModel.findOne({ contract: bill.contract });

//     if (currentBalance) {
//         const lateFee = currentBalance.balance * 0.2; // 20% penalty of the remaining balance

//         console.log(`Applying Late Fee for Contract ${bill.contract}: ₱${lateFee}`);

//         // Update totalAmount in the bill
//         bill.totalAmount += lateFee;

//         // Synchronize the balance with the updated totalAmount
//         currentBalance.balance += lateFee;

//         // Mark the late fee as applied
//         bill.lateFeeApplied = true;
//         bill.lateFeeDate = new Date();

//         // Save the updates
//         await bill.save();
//         await currentBalance.save();

//         console.log(`Penalty applied to Bill ID: ${bill._id}`);
//         console.log(`Updated Balance for Contract ${bill.contract}: ₱${currentBalance.balance}`);
//     } else {
//         console.log(`No balance found for Contract ${bill.contract}. Skipping penalty.`);
//     }
// }



// } catch (err) {
//     console.error('Error during scheduled billing job:', err);
// }

// });