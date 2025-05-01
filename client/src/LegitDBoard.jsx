import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LegitDBoard.css";

function LegitDBoard() {
    const [units, setUnits] = useState([]);
    const [unitTypes, setUnitTypes] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [totalDueThisMonth, setTotalDueThisMonth] = useState(0);
    const [rentReceivedThisMonth, setRentReceivedThisMonth] = useState(0);
    const [maintenanceDue, setMaintenanceDue] = useState(0);
    const [underMaintenanceUnits, setUnderMaintenanceUnits] = useState(0); // Units under maintenance
    const [overdueContracts, setOverdueContracts] = useState(0);
    const [overdueTotalAmount, setOverdueTotalAmount] = useState(0);
    const [activeTab, setActiveTab] = useState("All");
    const [bills, setBills] = useState([]);
    const [contractsDueThisMonth, setContractsDueThisMonth] = useState(0);
    const [maintenanceDetails, setMaintenanceDetails] = useState([]);
    const [occupiedUnits, setOccupiedUnits] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {

        const fetchMaintenancePaid = async () => {
            try {
                const response = await axios.get("http://localhost:3001/maintenancePaidTotal");
                console.log("API Response for Maintenance Paid:", response.data); // Debug log
                setMaintenanceDue(response.data.totalAmtPaid || 0);
            } catch (error) {
                console.error("Error fetching maintenance paid total:", error);
            }
        };

        fetchMaintenancePaid(); // Call the function


        const fetchBills = async () => {
            try {
                const response = await axios.get("http://localhost:3001/billing");
                console.log("Fetched bills:", response.data); // Debug log
                setBills(response.data); // Update the state with fetched data
            } catch (error) {
                console.error("Error fetching bills:", error);
            }
        };
        fetchBills();

        const fetchMaintenanceDetails = async () => {
            try {
                const response = await axios.get('http://localhost:3001/maintenanceDetails');
                console.log('Maintenance Details Fetched:', response.data); // Log data here
                setMaintenanceDetails(response.data);
            } catch (err) {
                console.error('Error fetching maintenance details:', err);
            }
        };
        
        fetchMaintenanceDetails();


        axios.get("http://localhost:3001/contract")
            .then(response => {
                const validContracts = response.data.filter(contract => contract.tenant); // Only contracts with tenants
                setContracts(validContracts);
                setOccupiedUnits(validContracts.length); // Total occupied units
            })
            .catch(err => console.error("Error fetching contracts:", err));

            
        axios.get("http://localhost:3001/maintenance")
        .then(response => {
            // Get today's date in dd/mm/yyyy format
            const today = new Date();
            const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
            console.log("Today's Date (Formatted):", formattedToday);
    
            const maintenanceUnits = response.data.filter(record => record.unit); // Filter valid maintenance records
            const dueToday = maintenanceUnits.filter(record => {
                // Parse and format each record's due date to dd/mm/yyyy
                const recordDate = new Date(record.dueDate);
                const formattedRecordDate = `${recordDate.getDate().toString().padStart(2, '0')}/${(recordDate.getMonth() + 1).toString().padStart(2, '0')}/${recordDate.getFullYear()}`;
                return formattedRecordDate === formattedToday; // Compare formatted dates
            });
    
            console.log("Maintenance Units:", maintenanceUnits);
            console.log("Maintenance Due Today:", dueToday);
    
            setUnderMaintenanceUnits(maintenanceUnits.length); // Total under maintenance
            setMaintenanceDueToday(dueToday.length); // Maintenance due today
        })
        .catch(err => console.error("Error fetching maintenance records:", err));


        axios.get("http://localhost:3001/unit")
            .then(response => setUnits(response.data))
            .catch(err => console.error("Error fetching units:", err));

        // Fetch maintenance details



        // Fetch tenants data
        axios.get("http://localhost:3001/users")
            .then(response => {
                setTenants(response.data);
            })
            .catch(err => console.error("Error fetching tenants:", err));

        // Fetch all unit types
        axios.get("http://localhost:3001/unittype")
            .then(response => setUnitTypes(response.data))
            .catch(err => console.error("Error fetching unit types:", err));
            
    }, []);

    const fetchOverdueRent = async () => {
        try {
            const response = await axios.get('http://localhost:3001/getOverdueRent');
            console.log('Overdue Rent Data:', response.data); // Debug log
            setOverdueContracts(response.data.contractCount || 0);
            setOverdueTotalAmount(response.data.totalOverdueAmount || 0);
        } catch (error) {
            console.error('Error fetching overdue rent data:', error);
        }
    };

    fetchOverdueRent();

    const fetchContractsDueThisMonth = async () => {
        try {
            const response = await axios.get("http://localhost:3001/getContractsDueThisMonth");
            console.log("Contracts Due This Month:", response.data); // Debug log
            setContractsDueThisMonth(response.data.contractCount || 0);
        } catch (error) {
            console.error("Error fetching contracts due this month:", error);
        }
    };

    fetchContractsDueThisMonth();

    const fetchBillsDueThisMonth = async () => {
        try {
            const response = await axios.get("http://localhost:3001/getBillsDueThisMonth");
            console.log("Bills Due This Month:", response.data); // Debug log
            setTotalDueThisMonth(response.data.totalDueThisMonth || 0);
        } catch (error) {
            console.error("Error fetching bills due this month:", error);
        }
    };
    
    fetchBillsDueThisMonth();

    const fetchPaymentsThisMonth = async () => {
        try {
            const response = await axios.get("http://localhost:3001/getPaymentsThisMonth");
            console.log("Payments received this month:", response.data.totalAmtPaid); // Debug log
            setRentReceivedThisMonth(response.data.totalAmtPaid || 0);
        } catch (error) {
            console.error("Error fetching payments this month:", error);
        }
    };
    
    fetchPaymentsThisMonth();


    const [selectedDate, setSelectedDate] = useState(new Date());

    

    const getTenancyDetails = () => {
        return contracts.map(contract => {
            const tenant = tenants.find(tenant => tenant._id === contract.tenant);
            const unit = units.find(unit => unit._id === contract.unit);
            const unitType = unitTypes.find(type => type._id === unit?.unitType)?.unitType || "Unknown Type";
            
            return tenant && unit ? {
                tenantName: `${tenant.firstName} ${tenant.lastName}`,
                unitNumber: unit.unitNumber,
                unitType: unitType === "UpNDown" ? "Up & Down" : unitType, // Display readable unit type
            } : null;
        }).filter(detail => detail !== null); // Exclude null entries
    };
    


     // Get details of each unit
     const getUnitDetails = () => {
        return units.map(unit => {
            const contract = contracts.find(c => c.unit === unit._id); // Find if the unit has a contract
            const isOccupied = !!contract;
            const unitType = unitTypes.find(type => type._id === unit.unitType)?.unitType || "Unknown";

            return {
                unitNumber: unit.unitNumber,
                unitType: unitType === "UpNDown" ? "Up & Down" : "Studio-type",
                status: isOccupied ? "Occupied" : "Not Occupied",
            };
        });
    };

    console.log(
    bills.filter((bill) => {
        const dueDate = new Date(bill.dueDate);
        const currentDate = new Date();

        return (
            dueDate.getMonth() === currentDate.getMonth() &&
            dueDate.getFullYear() === currentDate.getFullYear()
        );
    })
);

    const formatDate = (date) => {
        const options = {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        };
        return date.toLocaleDateString("en-US", options).toUpperCase();
    };

    const handlePreviousDate = () => {
        setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)));
    };

    const handleNextDate = () => {
        setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)));
    };


    return (
        <div className="LegitDBoard-container">                
            <div className="below-container">
                <div className="dashboard-container">
                    <h3>DASHBOARD</h3>
                    <div className="dashboard-boxes">
                        <div
                            className="dashboard-box"
                            onClick={() => navigate('/billing')}
                            style={{ cursor: "pointer" }}
                            >
                            <p className="dashboard-number">{contractsDueThisMonth}</p>
                            <p className="dashboard-label">Rent Due This Month</p>
                        </div>
                        <div
                            className="dashboard-box"
                            onClick={() => navigate('/billing')}
                            style={{ cursor: "pointer" }}
                            >
                            <p className="dashboard-number">{overdueContracts}</p>
                            <p className="dashboard-label">Rent Overdue</p>
                        </div>
                        <div
                            className="dashboard-box"
                            onClick={() => navigate('/maintenance')}
                            style={{ cursor: "pointer" }}
                            >
                            <p className="dashboard-number">{underMaintenanceUnits}</p>
                            <p className="dashboard-label">Maintenance Due</p>
                            </div>
                            <div
                            className="dashboard-box"
                            onClick={() => navigate('/maintenance')}
                            style={{ cursor: "pointer" }}
                            >
                            <p className="dashboard-number">{underMaintenanceUnits}</p>
                            <p className="dashboard-label">Under Maintenance</p>
                        </div>
                        <div
                            className="dashboard-box"
                            onClick={() => navigate('/contracts')}
                            style={{ cursor: "pointer" }}
                            >
                            <p className="dashboard-number">{occupiedUnits}</p>
                            <p className="dashboard-label">Occupied Units</p>
                        </div>
                    </div>
                </div>
                <div className="rent-content">
                        <h3>RENT</h3>
                            <div className="rent-summary">
                                <p><strong>Due This Month:</strong> ₱{totalDueThisMonth.toLocaleString()}.00</p>
                                <p><strong>Received This Month:</strong> ₱{rentReceivedThisMonth.toLocaleString()}.00</p>
                                <p><strong>Overdue:</strong> ₱{overdueTotalAmount.toLocaleString()}.00</p>
                                <p><strong>Maintenance Paid:</strong> ₱{maintenanceDue.toLocaleString()}.00</p>
                            </div>
                    </div>
            </div>
            <div className="summary-content">
                <div className="summary-header">
                    {/* <button className="arrow-btn" onClick={handlePreviousDate}>&lt;</button> */}
                    <h3>{formatDate(selectedDate)}</h3>
                        {/* <input
                            type="date"
                            id="date-picker"
                            className="hidden-date-input"
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        /> */}
                    {/* <button className="arrow-btn" onClick={handleNextDate}>&gt;</button> */}
                </div>
                <div className="summary-options">
                    <button 
                        className={`option-btn ${activeTab === "All" ? "active" : ""}`}
                        onClick={() => setActiveTab("All")}
                    >
                        All
                    </button>
                    <button 
                        className={`option-btn ${activeTab === "Tenancy" ? "active" : ""}`}
                        onClick={() => setActiveTab("Tenancy")}
                    >
                        Tenancy
                    </button>
                    <button 
                        className={`option-btn ${activeTab === "Units" ? "active" : ""}`}
                        onClick={() => setActiveTab("Units")}
                    >
                        Units
                    </button>
                    <button 
                        className={`option-btn ${activeTab === "Rent Due" ? "active" : ""}`}
                        onClick={() => setActiveTab("Rent Due")}
                    >
                        Rent Due
                    </button>
                    <button 
                        className={`option-btn ${activeTab === "Maintenance" ? "active" : ""}`}
                        onClick={() => setActiveTab("Maintenance")}
                    >
                        Maintenance
                    </button>
                </div>
                <div className="summary-body">
                {activeTab === "All" && (
                        <div className="all-entries-scrollable">
                            <h3>All</h3>
                            <ul className="all-entries-list">
                                {getTenancyDetails().map((detail, index) => (
                                    <li key={`tenancy-${index}`}>
                                        <strong>{detail.tenantName}</strong> occupies <strong>Unit #{detail.unitNumber}</strong> ({detail.unitType})
                                    </li>
                                ))}
                                {getUnitDetails().map((unit, index) => (
                                    <li key={`unit-${index}`}>
                                        <strong>Unit #{unit.unitNumber}</strong> ({unit.unitType}) -{" "}
                                        <span style={{ color: unit.status === "Occupied" ? "green" : "red" }}>
                                            {unit.status}
                                        </span>
                                    </li>
                                ))}
                                {bills.length > 0
                                    ? bills.map((bill, index) => (
                                        <li key={`bill-${index}`}>
                                            <strong>{bill.tenant.firstName} {bill.tenant.lastName}</strong> - Rent due on{" "}
                                            <strong>{new Date(bill.dueDate).toLocaleDateString()}</strong> - Amount: ₱
                                            <strong>{bill.totalAmount.toLocaleString()}</strong>
                                        </li>
                                    ))
                                    : <li>No rent due available.</li>
                                }
                                {maintenanceDetails.length > 0
                                    ? maintenanceDetails.map((record, index) => {
                                        const unit = record.unit;
                                        const unitType = unit?.unitType?.unitType || "Unknown Type";
                                        const unitNumber = unit?.unitNumber || "Unknown Number";

                                        return (
                                            <li key={`maintenance-${index}`}>
                                                <strong>Unit:</strong> {unitType} - {unitNumber} <br />
                                                <strong>Maintenance Type:</strong> {record.maintenanceType} <br />
                                                <strong>Due Date:</strong> {new Date(record.dueDate).toLocaleDateString()} <br />
                                                <strong>Cost:</strong> ₱{record.cost.toFixed(2)}
                                            </li>
                                        );
                                    })
                                    : <li>No maintenance records available.</li>
                                }
                            </ul>
                        </div>
                    )}
                    {activeTab === "Tenancy" && (
                        <div>
                            <h3>Tenancy</h3>
                            <ul className='tenancy'>
                                {getTenancyDetails().map((detail, index) => (
                                    <li key={index}>
                                        <strong>{detail.tenantName}</strong> occupies <strong>Unit #{detail.unitNumber}</strong> 
                                        ({detail.unitType})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                   {activeTab === "Units" && (
                        <div>
                            <h3>Units</h3>
                            <ul className="units-list">
                                {getUnitDetails().map((unit, index) => (
                                    <li key={index}>
                                        <strong>Unit #{unit.unitNumber}</strong> ({unit.unitType}) -{" "}
                                        <span style={{ color: unit.status === "Occupied" ? "green" : "red" }}>
                                            {unit.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === "Rent Due" && (
                        <div>
                            <h3>Rent Due</h3>
                            {bills.length > 0 ? (
                                <ul className="rent-due-list">
                                    {bills.map((bill, index) => (
                                        <li key={index}>
                                            <strong>{bill.tenant.firstName} {bill.tenant.lastName}</strong> - Rent due on{" "}
                                            <strong style={{ color: 'red' }}>{new Date(bill.dueDate).toLocaleDateString()}</strong> - Amount: ₱
                                            <strong>{bill.totalAmount.toLocaleString()}</strong>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No rent due available.</p>
                            )}
                        </div>
                    )}
                    {activeTab === "Maintenance" && (
                    <div>
                        <h3>Maintenance</h3>
                            {maintenanceDetails.length > 0 ? (
                                <ul className="maintenance-list">
                                    {maintenanceDetails.map((record, index) => {
                                        const unit = record.unit;
                                        const unitType = unit?.unitType?.unitType || "Unknown Type"; // Safely access `unitType`
                                        const unitNumber = unit?.unitNumber || "Unknown Number";

                                        return (
                                            <li key={index} style={{ marginBottom: "10px" }}>
                                                <strong>Unit:</strong> {unitType} - {unitNumber} <br />
                                                <strong>Maintenance Type:</strong> {record.maintenanceType} <br />
                                                <strong>Due Date:</strong> {new Date(record.dueDate).toLocaleDateString()} <br />
                                                <strong>Cost:</strong> ₱{record.cost.toFixed(2)}
                                            </li>
                                        );
                                    })}

                            </ul>                           
                        ) : (
                            <p>No maintenance records available.</p>
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}


export default LegitDBoard;