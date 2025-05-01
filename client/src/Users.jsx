import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./User.css";
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

function Users() {
    const [unitTypes, setUnitTypes] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [billingLogs, setBillingLogs] = useState([]); // Add state for billing logs
    const [occupiedUnits, setOccupiedUnits] = useState(0);
    const [underMaintenanceUnits, setUnderMaintenanceUnits] = useState(0); // Units under maintenance
    const [maintenanceDueToday, setMaintenanceDueToday] = useState(0); // Maintenance due today
    const [receivedThisMonth, setReceivedThisMonth] = useState(0);
    const [overduePayments, setOverduePayments] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {

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



        // Fetch tenants data
        axios.get("http://localhost:3001/users")
            .then(response => {
                setTenants(response.data);
            })
            .catch(err => console.error("Error fetching tenants:", err));
            
    }, []);

    
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate(); // Last day of the month
    };

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // Months are 0-indexed
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    const [selectedDate, setSelectedDate] = useState(new Date());

    const handlePreviousDate = () => {
        setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)));
    };

    const handleNextDate = () => {
        setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)));
    };

    return (
        <div className="user-container">
            <div className="below-container">
                <div className="dashboard-container">
                    <h3>DASHBOARD</h3>
                    <div className="dashboard-boxes">
                        <div className="dashboard-box">
                            <p className="dashboard-number">0</p>
                            <p className="dashboard-label">Rent Due Today</p>
                        </div>
                        <div className="dashboard-box">
                            <p className="dashboard-number">0</p>
                            <p className="dashboard-label">Rent Overdue</p>
                        </div>
                        <div className="dashboard-box">
                            <p className="dashboard-number">{maintenanceDueToday}</p>
                            <p className="dashboard-label">Maintenance Due Today</p>
                        </div>
                        <div className="dashboard-box">
                            <p className="dashboard-number">{underMaintenanceUnits}</p>
                            <p className="dashboard-label">Under Maintenance</p>
                        </div>
                        <div className="dashboard-box">
                            <p className="dashboard-number">{occupiedUnits}</p>
                            <p className="dashboard-label">Occupied Units</p>
                        </div>
                    </div>
                </div>
            <div className="calendar-content">
                    <h3>
                        {`${new Date().toLocaleString('default', { month: 'long' })}, ${new Date().getFullYear()}`}
                    </h3>
                    <div className="calendar">
                        {[
                            // Add empty slots for days before the first day of the month
                            ...Array(new Date(currentYear, currentMonth, 1).getDay()).fill(null),
                            // Add actual days of the current month
                            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
                        ].map((day, index) => {
                            if (day !== null) {
                                const isRentDue = tenants.some(tenant =>
                                    billingLogs.some(bill =>
                                        new Date(bill.dueDate).getDate() === day && bill.tenant === tenant._id
                                    )
                                );
                                const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

                                return (
                                    <div
                                        key={index}
                                        className={`calendar-day ${isRentDue ? "rent-due" : ""} ${isToday ? "today" : ""}`}
                                    >
                                        {day}
                                    </div>
                                );
                            }
                            // Empty slots for alignment
                            return <div key={index} className="calendar-day empty"></div>;
                        })}
                    </div>
                </div>
            </div>
            <div className="below-container">
            <div className="summary-content">
                <div className="summary-header">
                    <button className="arrow-btn" onClick={handlePreviousDate}>&lt;</button>
                    <h3>
                        {selectedDate.toLocaleString('default', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        }).toUpperCase()} {/* Capitalizes the date */}
                    </h3>
                    <button className="arrow-btn" onClick={handleNextDate}>&gt;</button>
                </div>
                <div className="summary-options">
                    <button className="option-btn active">All</button>
                    <button className="option-btn">Tenancy</button>
                    <button className="option-btn">Units</button>
                    <button className="option-btn">Rent Due</button>
                    <button className="option-btn">Others</button>
                </div>
                <div className="summary-body">
                    <p>No events available.</p>
                </div>
            </div>
                <div className="rent-content">
                    <h3>RENT</h3>
                    <div className="rent-summary">
                        <div className="rent-progress">
                            <div className="progress-circle">
                                <span></span>
                            </div>
                            <p>Received</p>
                        </div>
                        <p>.00 Due This Month</p>
                        <p>₱{receivedThisMonth.toLocaleString()}.00 Received This Month</p>
                        <p>₱{overduePayments.toLocaleString()}.00 Overdue</p>
                    </div>
                </div>
            </div>

        </div>
    );
}


export default Users;