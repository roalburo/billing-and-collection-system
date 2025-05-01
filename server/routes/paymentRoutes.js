const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment'); // Import Payment model
const Balance = require('../models/Balance'); // Import Balance model

// Route to record a payment
router.post('/recordPayment', async (req, res) => {
  try {
    const { contract, tenant, amount, method, date, useAdvancePayment } = req.body;

    // Find the balance record for this contract
    const balanceRecord = await Balance.findOne({ contract });

    if (!balanceRecord) {
      return res.status(404).json({ message: 'Balance record not found.' });
    }

    let remainingAmount = amount;

    // Deduct from advance payment first, if opted
    if (useAdvancePayment && balanceRecord.advancePayment > 0) {
      if (balanceRecord.advancePayment >= remainingAmount) {
        balanceRecord.advancePayment -= remainingAmount;
        remainingAmount = 0;
      } else {
        remainingAmount -= balanceRecord.advancePayment;
        balanceRecord.advancePayment = 0;
      }
    }

    // Deduct remaining amount from balance
    if (remainingAmount > 0) {
      if (remainingAmount > balanceRecord.balance) {
        // If payment exceeds the balance, add excess to credit
        balanceRecord.credit += remainingAmount - balanceRecord.balance;
        balanceRecord.balance = 0;
      } else {
        balanceRecord.balance -= remainingAmount;
      }
    }

    // Save the updated balance record
    await balanceRecord.save();

    // Record the payment in the Payment collection
    const newPayment = new Payment({
      contract,
      tenant,
      amount,
      method,
      date,
    });
    await newPayment.save();

    res.status(200).json({ message: 'Payment recorded successfully.', balance: balanceRecord });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
