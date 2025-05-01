import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './BillingPayment.css';
import axios from 'axios';


function BillingPayment() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('tenants');
  const [selectedContractView, setSelectedContractView] = useState('active'); // State to toggle between active and expired contracts
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showBillForm, setShowBillForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showBillingLogsModal, setShowBillingLogsModal] = useState(false);
  const [activeContracts, setActiveContracts] = useState([]);
  const [expiredContracts, setExpiredContracts] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [billingLogs, setBillingLogs] = useState([]);
  const [paymentLogs, setPaymentLogs] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [unittypes, setUnitTypes] = useState([]);
  const [balance, setBalance] = useState([]);
  const [balances, setBalances] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [maintenanceBal, setMaintenanceBal] = useState([]);
  const [selectedMaintenance, setSelectedMaintenance] = useState("");
  const [amtPaid, setAmtPaid] = useState("");
  const [datePaid, setDatePaid] = useState("");
  const [showPaymentLogsModal, setShowPaymentLogsModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedUnitType, setSelectedUnitType] = useState(""); // State for selected unit type
  const [advanceDeposit, setAdvanceDeposit] = useState(0);
  const [mPaymentLogs, setMPaymentLogs] = useState([]);
  const [showMPaymentLogsModal, setShowMPaymentLogsModal] = useState(false);

  const handlePaymentLogsToggle = () => {
    setShowPaymentLogsModal(!showPaymentLogsModal);
  };
  
  

  useEffect(() => {
    
    const fetchContracts = async () => {
      try {
        const activeContractsResponse = await axios.get('http://localhost:3001/contract');
        const expiredContractsResponse = await axios.get('http://localhost:3001/expiredcontract');
        setActiveContracts(activeContractsResponse.data);
        setExpiredContracts(expiredContractsResponse.data);
      } catch (err) {
        console.error('Error fetching contracts:', err);
      }
    };
    fetchContracts();

    // axios.get('http://localhost:3001/contract')
    // .then(result => {
    //   setContracts(result.data);
    // })
    // .catch(err => console.error('Error fetching contracts:', err));

    axios.get(`http://localhost:3001/users`)
    .then(result => {
        setTenants(result.data);
    })
    .catch(err => console.error('Error fetching tenants:', err));

    axios.get(`http://localhost:3001/unit`)
    .then(result => {
        setUnits(result.data);
    })
    .catch(err => console.error('Error fetching units:', err));

    axios.get(`http://localhost:3001/unittype`)
    .then(result => {
        setUnitTypes(result.data);
    })
    .catch(err => console.error('Error fetching unit types:', err));

    axios.get(`http://localhost:3001/balance`)
    .then(result => {
        setBalances(result.data || 0);
    })
    .catch(err => console.error('Error fetching balances:', err));

    axios.get(`http://localhost:3001/maintenance`)
    .then(result => {
        setMaintenance(result.data);
    })
    .catch(err => console.error('Error fetching maintenance:', err));

    axios.get(`http://localhost:3001/maintenanceBal`)
    .then(result => {
        setMaintenanceBal(result.data);
    })
    .catch(err => console.error('Error fetching maintenance payments:', err));

    axios.get('http://localhost:3001/contract')
    .then(result => setContracts(result.data))
    .catch(err => console.error('Error fetching contracts:', err));

axios.get('http://localhost:3001/users')
    .then(result => setTenants(result.data))
    .catch(err => console.error('Error fetching tenants:', err));

axios.get('http://localhost:3001/unit')
    .then(result => setUnits(result.data))
    .catch(err => console.error('Error fetching units:', err));

axios.get('http://localhost:3001/unittype')
    .then(result => setUnitTypes(result.data))
    .catch(err => console.error('Error fetching unit types:', err));

axios.get('http://localhost:3001/balance')
    .then(result => setBalances(result.data || [])) // Fetch all balances
    .catch(err => console.error('Error fetching balances:', err));
  }, []);

  const handleContractViewSwitch = (view) => {
    setSelectedContractView(view);
    setSelectedTenant(null); // Reset selected tenant when switching views
  };

  const handleTenantClick = (contract) => {
    setSelectedTenant(contract);
    setShowBillForm(false);
    setShowPaymentForm(false);
    setShowBillingLogsModal(false);

    axios.get(`http://localhost:3001/getAdvanceDeposit/${contract._id}`)
    .then((response) => {
      setAdvanceDeposit(response.data?.advanceDeposit || 0);
    })
    .catch(err => console.error('Error fetching advance deposit balance:', err));

    axios.get(`http://localhost:3001/getPayment/${contract._id}`)
    .then(response => {
      console.log("Payments retrieved:", response.data);
      setPaymentLogs(Array.isArray(response.data) ? response.data : []);
    })
    .catch(err => console.error('Error fetching payments:', err));

    axios.get(`http://localhost:3001/getBilling/${contract._id}`)
    .then(response => {
      console.log("Bills retrieved:", response.data);
      setBillingLogs(Array.isArray(response.data) ? response.data : []);
    })
    .catch(err => console.error('Error fetching bills:', err));

    axios.get(`http://localhost:3001/getBalance/${contract._id}`)
        .then(response => {
          console.log("Balance retrieved:", response.data);
            if (response.data && response.data.balance !== undefined) {
                setBalance(response.data);
            } else {
                setBalance({ balance: parseFloat(contract.monthlyRent) });
            }
        })
        .catch(err => console.error('Error fetching balance:', err));
};

  // Function to handle invoice download
  const handleDownloadInvoice = async (billingId) => {
    try {
      const response = await axios.get(`http://localhost:3001/generateInvoice/${billingId}`, {
        responseType: 'blob', // Important for downloading files
      });

      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${billingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert('Failed to download invoice.');
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();

    const { isLatePayment } = e.target.elements;

    try {
        // Fetch the current balance for the selected contract
        const balanceResponse = await axios.get(`http://localhost:3001/getBalance/${selectedTenant._id}`);
        const currentBalance = parseFloat(balanceResponse.data?.balance || 0);

        // Fetch updated billing logs for the selected contract
        const billingResponse = await axios.get(`http://localhost:3001/getBilling/${selectedTenant._id}`);
        const updatedBillingLogs = Array.isArray(billingResponse.data) ? billingResponse.data : [];
        setBillingLogs(updatedBillingLogs);

        // Get the current date
        const currentDate = new Date();

        // Find the most recent bill for this contract
        const lastBill = updatedBillingLogs
            .filter((log) => log.contract === selectedTenant._id)
            .sort((a, b) => new Date(b.billDate) - new Date(a.billDate))[0];

        // Determine the start date for the new bill
        const startDate = lastBill ? new Date(lastBill.billDate) : new Date(selectedTenant.startDate);

        // Prevent duplication if the most recent bill is for the current month and year
        if (
            lastBill &&
            new Date(lastBill.billDate).getMonth() === currentDate.getMonth() &&
            new Date(lastBill.billDate).getFullYear() === currentDate.getFullYear()
        ) {
            alert('A bill for this month already exists.');
            return;
        }

        // Check if the last bill has an unpaid balance and its due date has passed
        let applyLateFee = false;
        if (lastBill) {
            const lastDueDate = new Date(lastBill.dueDate);
            if (currentDate > lastDueDate && lastBill.totalAmount > 0) {
                applyLateFee = true; // Late fee applies only if the previous bill is overdue
            }
        }

        // Calculate the next bill date
        const nextBillDate = new Date(startDate);
        nextBillDate.setMonth(nextBillDate.getMonth() + 1); // Move to the next month

        // Calculate the due date (7 days after the next bill date)
        const dueDate = new Date(nextBillDate);
        dueDate.setDate(dueDate.getDate() + 7);

        // Calculate the adjusted rent amount based on overpayment/underpayment
        let rentAmount = parseFloat(selectedTenant.monthlyRent);
        let adjustedAmount = rentAmount - currentBalance; // Adjust for overpayment/underpayment

        // Ensure the total amount is not negative
        if (adjustedAmount < 0) {
            adjustedAmount = 0; // Overpayment fully covers the rent
        }

        // Apply late fee only if applicable (last bill overdue and late fee checked)
        if (isLatePayment.checked && applyLateFee) {
            adjustedAmount += adjustedAmount * 0.2; // Add 20% late fee
        }

        const newBill = {
            contract: selectedTenant._id,
            tenant: selectedTenant.tenant,
            rentAmount,
            totalAmount: adjustedAmount,
            billDate: nextBillDate,
            dueDate,
        };

        // Create the new bill
        await axios.post('http://localhost:3001/createBill', newBill);
        alert('Bill created successfully!');
        console.log(`Bill created for ${nextBillDate.toLocaleDateString()}`);

        // Update the billing logs after successful bill creation
        setBillingLogs((prevLogs) => [...prevLogs, newBill]);

    } catch (err) {
        console.error('Failed to create bill:', err);
        alert('An error occurred while generating the bill.');
    }

    setShowBillForm(false); // Close the bill form
};  
  

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const { paymentAmount, paymentMode, referenceNumber } = e.target.elements;
    const amount = parseFloat(paymentAmount.value);

    // if (isNaN(amount) || amount <= 0) {
    //     alert('Invalid amount format. Please enter a number greater than zero.');
    //     return;
    // }

    try {
        if (paymentMode.value === "Advance Deposit") {
            if (amount > advanceDeposit) {
                alert('Insufficient advance deposit balance.');
                return;
            }

            // Calculate new advance deposit balance with precision
            const newAdvanceDeposit = Math.max(0, parseFloat((advanceDeposit - amount).toFixed(2)));

            // Update advance deposit in the backend
            await axios.put(`http://localhost:3001/updateAdvanceDeposit/${selectedTenant._id}`, {
                advanceDeposit: amount, // Sending the amount to deduct
            });

            // Fetch the current balance
            const balanceResponse = await axios.get(`http://localhost:3001/getBalance/${selectedTenant._id}`);
            const currentBalance = parseFloat(balanceResponse.data?.balance || 0);

            // Calculate the new balance
            const newBalance = currentBalance - amount;

            // Update the balance in the backend
            await axios.put(`http://localhost:3001/updateBalance/${selectedTenant._id}`, {
                balance: newBalance,
            });

            // Record the payment in the backend
            const newPayment = {
                contract: selectedTenant._id,
                tenant: selectedTenant.tenant,
                amount,
                date: new Date(),
                method: "Advance Deposit",
            };
            await axios.post("http://localhost:3001/createPayment", newPayment);

            // Update frontend states
            setAdvanceDeposit(newAdvanceDeposit); // Update advance deposit
            setBalance({ balance: newBalance }); // Update balance
            setPaymentLogs(prevLogs => [...prevLogs, newPayment]); // Add the payment to logs

            alert('Advance deposit used successfully.');
        } else {
            // Handle other payment methods (e.g., Cash, Check)
            const balanceResponse = await axios.get(`http://localhost:3001/getBalance/${selectedTenant._id}`);
            const currentBalance = parseFloat(balanceResponse.data?.balance || 0);

            // Calculate the new balance
            const newBalance = currentBalance - amount;

            // Record the payment
            const newPayment = {
                contract: selectedTenant._id,
                tenant: selectedTenant.tenant,
                amount,
                date: new Date(),
                method: paymentMode.value,
                referenceNumber: referenceNumber.value,
            };
            await axios.post("http://localhost:3001/createPayment", newPayment);

            // Update the balance in the backend
            await axios.put(`http://localhost:3001/updateBalance/${selectedTenant._id}`, {
                balance: newBalance,
            });

            // Update frontend states
            setBalance({ balance: newBalance }); // Update balance
            setPaymentLogs(prevLogs => [...prevLogs, newPayment]); // Add the payment to logs

            alert('Payment recorded successfully.');
        }
    } catch (err) {
        console.error('Failed to record payment or update balance:', err);
        alert('An error occurred while recording the payment.');
    }

    setShowPaymentForm(false); // Close the payment form
};


 
  const handleSubmit = (event) => {
    event.preventDefault();

    const amount = parseFloat(amtPaid);
    const today = new Date();
    const selectedDate = new Date(datePaid);

    if (selectedDate < today.setHours(0, 0, 0, 0)) {
      alert("Date paid cannot precede current date.");
      return;
    }

    const paymentData = {
        maintenance: selectedMaintenance,
        amtPaid: parseFloat(amtPaid),
        datePaid: datePaid
    };

    axios.post('http://localhost:3001/maintenanceBal', paymentData)
        .then(() => {
            navigate('/maintenance');
        })
        .catch(err => console.log(err));
  };

  const filterPaymentLogs = (maintenanceId) => {
    return maintenanceBal.filter(log => log.maintenance === maintenanceId);
  }

  const handleViewSwitch = (view) => {
    setSelectedView(view);
    setSelectedTenant(null);
  };

  const handleViewPaymentLogs = (maintenanceId) => {
    const filteredLogs = filterPaymentLogs(maintenanceId);
    setMPaymentLogs(filteredLogs);
    setShowMPaymentLogsModal(true);
  };
  
  return (
    <div className="billing-payment">
      {/* View Toggle Buttons */}
      <div className="view-toggle mb-3">
        <button
          className={`toggle-button ${selectedView === 'tenants' ? 'active' : ''}`}
          onClick={() => handleViewSwitch('tenants')}
          style={{ marginTop: '5vh', fontSize: '2rem' }}
        >
          Tenants
        </button>
        <button
          className={`toggle-button ${selectedView === 'maintenance' ? 'active' : ''}`}
          onClick={() => handleViewSwitch('maintenance')}
          style={{ marginTop: '5vh', fontSize: '2rem' }}
        >
          Maintenance
        </button>
      </div>

      {selectedView === 'tenants' ? (
        
        <div className="tenant-content">
          <h2>Tenants</h2>
          {/* Contract View Toggle */}
          <div className="contract-toggle mb-3">
            <button
              className={`toggle-button ${selectedContractView === 'active' ? 'active' : ''}`}
              onClick={() => handleContractViewSwitch('active')}
            >
              Active Contracts
            </button>
            <button
              className={`toggle-button ${selectedContractView === 'expired' ? 'active' : ''}`}
              onClick={() => handleContractViewSwitch('expired')}
            >
              Expired Contracts
            </button>
          </div>

          {/* Filter by Unit Type */}
          <div className="mb-3">
            <label>Filter by Unit Type:</label>
            <select
              className="form-control"
              value={selectedUnitType}
              onChange={(e) => setSelectedUnitType(e.target.value)}
            >
              <option value="">All</option>
              {unittypes.map((ut) => (
                <option key={ut._id} value={ut.unitType}>
                  {ut.unitType}
                </option>
              ))}
            </select>
          </div>
          

          <div className="table-container">
            <table className="table table-striped mb-3">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Tenant Name</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(selectedContractView === 'active' ? activeContracts : expiredContracts)
                  .filter((contract) => {
                    const unit = units.find((u) => u._id === contract.unit);
                    const unittype = unittypes.find((ut) => ut._id === unit?.unitType);
                    return selectedUnitType === "" || unittype?.unitType === selectedUnitType;
                  })
                  .map((contract) => {
                    const tenant = tenants.find((t) => t._id === contract.tenant);
                    const unit = units.find((u) => u._id === contract.unit);
                    const unittype = unittypes.find((ut) => ut._id === unit?.unitType);
                    const bal = balances.find((b) => b.contract === contract._id) || { balance: 0 };

                    if (tenant && unit) {
                      const unitDisplay = unittype
                        ? `${unittype.unitType} ${unit.unitNumber}`
                        : unit.unitNumber;

                      return (
                        <tr key={contract._id}>
                          <td>{unitDisplay}</td>
                          <td>
                            <strong>
                              {tenant.firstName} {tenant.lastName}
                            </strong>
                          </td>
                          <td>₱{bal.balance.toFixed(2)}</td>
                          <td>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleTenantClick(contract)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  })}
              </tbody>
            </table>
          </div>


      

         {/* Tenant Details */}

{selectedTenant && (

<div className="modal">
<div className="modal-content">
  <span
    className="close"
    onClick={() => setSelectedTenant(null)} // Close the modal by resetting the tenant
  >
    &times;
  </span>

  {/* Tenant and Unit Information */}
  <h2>
    {unittypes.find((ut) => ut._id === units.find((u) => u._id === selectedTenant.unit)?.unitType)?.unitType || "Unknown Unit"}{" "}
    {units.find((u) => u._id === selectedTenant.unit)?.unitNumber || ""} -{" "}
    {tenants.find((t) => t._id === selectedTenant.tenant)?.firstName}{" "}
    {tenants.find((t) => t._id === selectedTenant.tenant)?.lastName}
  </h2>

  <p>
    <strong>Balance:</strong> ₱
    {balances.find((b) => b.contract === selectedTenant._id)?.balance?.toFixed(2) || "0.00"}
  </p>

  <p>
    <strong>Advance Deposit Balance:</strong> ₱{advanceDeposit.toFixed(2)}
  </p>

  {/* Buttons for Logs */}
  <button
    onClick={() => setShowBillingLogsModal(true)}
    className="btn btn-primary mb-3"
  >
    View Billing Logs
  </button>
  <button
    onClick={() => setShowPaymentLogsModal(true)}
    className="btn btn-secondary mb-3"
  >
    View Payment Logs
  </button>

  {/* Billing Logs Modal */}
  {showBillingLogsModal && (
    <div className="modal">
      <div className="modal-content">
        <span
          className="close"
          onClick={() => setShowBillingLogsModal(false)}
        >
          &times;
        </span>
        <h3>Billing Logs</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Rent Amount</th>
              <th>Total Amount</th>
              <th>Bill Date</th>
              <th>Due Date</th>
              <th>Late Fee Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {billingLogs.map((log, index) => (
              <tr key={index}>
                <td>₱{log.rentAmount.toFixed(2)}</td>
                <td>₱{log.totalAmount.toFixed(2)}</td>
                <td>{new Date(log.billDate).toLocaleDateString()}</td>
                <td>{new Date(log.dueDate).toLocaleDateString()}</td>
                <td>
                  {log.lateFeeApplied ? (
                    <span style={{ color: "red" }}>
                      Penalty Applied on {new Date(log.lateFeeDate).toLocaleDateString()}
                    </span>
                  ) : (
                    "No Penalty"
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleDownloadInvoice(log._id)}
                  >
                    Download Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}

  <div className="form-buttons mb-3">
    <button onClick={() => setShowPaymentForm(true)} className="btn btn-secondary">Record Payment</button>
  </div>
</div>



{showPaymentLogsModal && (
  <div className="modal">
    <div className="modal-content">
      <span className="close" onClick={() => setShowPaymentLogsModal(false)}>
        &times;
      </span>
      <h3>Payment Logs</h3>
      {paymentLogs.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Method</th>
              <th>Receipt/Check No.</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {paymentLogs.map((log, index) => (
              <tr key={index}>
                <td>₱{log.amount.toFixed(2)}</td>
                <td>{log.method}</td>
                <td>{log.referenceNumber || "N/A"}</td>
                <td>{new Date(log.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No payment logs available for this tenant.</p>
      )}
    </div>
  </div>
)}


            {/* Record Payment Form */}
            {showPaymentForm && (
  <div className="modal">
    <div className="modal-content">
      <span
        className="close"
        onClick={() => setShowPaymentForm(false)} // Close the modal
      >
        &times;
      </span>
      <h3>Record Payment</h3>
      <form onSubmit={handleRecordPayment} className="form">
        <div className="form-group">
          <label htmlFor="paymentAmount">Amount:</label>
          <input
            id="paymentAmount"
            type="number"
            name="paymentAmount"
            className="form-control"
            placeholder="Enter payment amount"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="paymentMode">Payment Mode:</label>
          <select
            id="paymentMode"
            name="paymentMode"
            className="form-control"
            required
          >
            <option value="">--Select Payment Mode--</option>
            <option value="Cash">Cash</option>
            <option value="Check">Check</option>
            <option value="Advance Deposit">
              Use Advance Deposit (Remaining: ₱{advanceDeposit.toFixed(2)})
            </option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="referenceNumber">
            {document.getElementById("paymentMode")?.value === "Check"
              ? "Check No."
              : "Receipt No. / Check No."}
          </label>
          <input
            id="referenceNumber"
            type="text"
            name="referenceNumber"
            className="form-control"
            placeholder={`Enter ${
              document.getElementById("paymentMode")?.value === "Check"
                ? "check"
                : "receipt"
            } number`}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Record Payment
        </button>
      </form>
    </div>
  </div>
)}



          </div>
        )}
      </div>
    ) : (
      <div className="maintenance-content p-3">
        <div className='tenant-content unit-list w-100'>
          <h2>Maintenance</h2>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Maintenance Type</th>
                <th>Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenance.map((record) => {
                const unit = units.find((u) => u._id === record.unit);
                const unittype = unittypes.find((ut) => ut._id === unit?.unitType);
                const unitDisplay = unittype
                  ? `${unittype.unitType} - ${unit.unitNumber}`
                  : unit?.unitNumber || "Unknown Unit";

                return (
                  <tr key={record._id}>
                    <td>{unitDisplay}</td>
                    <td>{record.maintenanceType}</td>
                    <td>₱{record.cost.toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-primary me-2"
                        onClick={() => handleViewPaymentLogs(record._id)}
                      >
                        View Payment Logs
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedMaintenance(record);
                          setShowPaymentForm(true);
                        }}
                      >
                        Pay Bill
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {showMPaymentLogsModal && (
            <div className="modal">
              <div className="modal-content p-3">
                <span
                  className="close"
                  onClick={() => setShowMPaymentLogsModal(false)}
                >
                  &times;
                </span>
                <h3>Payment Logs</h3>
                {mPaymentLogs?.length > 0 ? (
                  <ul>
                    {mPaymentLogs.map((log, index) => (
                      <li key={index}>
                        <strong>Amount:</strong> ₱{log.amtPaid.toFixed(2)} |{" "}
                        <strong>Date:</strong>{" "}
                        {new Date(log.datePaid).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No payment logs available for this record.</p>
                )}
              </div>
            </div>
          )}
          {showPaymentForm && (
            <div className="modal">
              <div className="modal-content p-3">
                <span
                  className="close"
                  onClick={() => setShowPaymentForm(false)}
                >
                  &times;
                </span>
                <h3>Pay Maintenance Bill</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label>Amount Paid:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={amtPaid}
                      onChange={(e) => setAmtPaid(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Date Paid:</label>
                    <input
                      type="date"
                      className="form-control"
                      value={datePaid}
                      onChange={(e) => setDatePaid(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Save Payment
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
}
export default BillingPayment;