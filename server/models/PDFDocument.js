const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Generate Invoice PDF
app.get('/generateInvoice/:billingId', async (req, res) => {
    const { billingId } = req.params;

    try {
        const billing = await BillingModel.findById(billingId).populate('contract').populate('tenant');
        if (!billing) {
            return res.status(404).json({ message: 'Billing not found' });
        }

        // Create a PDF document
        const doc = new PDFDocument();

        // Pipe to response
        const filename = `Invoice-${billingId}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        // Add Invoice Content
        doc.fontSize(20).text('Invoice Statement', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Invoice ID: ${billingId}`);
        doc.text(`Tenant: ${billing.tenant.firstName} ${billing.tenant.lastName}`);
        doc.text(`Contract: ${billing.contract}`);
        doc.text(`Rent Amount: ₱${billing.rentAmount.toFixed(2)}`);
        doc.text(`Late Fee: ₱${billing.lateFee.toFixed(2)}`);
        doc.text(`Advance Payment Applied: ₱${billing.advancePayment.toFixed(2)}`);
        doc.text(`Total Amount Due: ₱${billing.totalAmount.toFixed(2)}`);
        doc.text(`Bill Date: ${new Date(billing.billDate).toLocaleDateString()}`);
        doc.text(`Due Date: ${new Date(billing.dueDate).toLocaleDateString()}`);
        doc.moveDown();

        doc.text('Thank you for your payment.', { align: 'center' });

        // Finalize PDF
        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error generating invoice', error: err });
    }
});
