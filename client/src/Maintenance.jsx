import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Contracts.css";
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';

function Maintenance() {
    const [maintenance, setMaintenance] = useState([]);
    const [units, setUnits] = useState([]);
    const [unitTypes, setUnitTypes] = useState([]);
    const [balances, setBalances] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        // Fetch units
        axios.get('http://localhost:3001/unit')
            .then(result => setUnits(result.data))
            .catch(err => console.error(err));

        // Fetch unit types
        axios.get('http://localhost:3001/unittype')
            .then(result => {
                setUnitTypes(result.data);
                if (result.data.length > 0) {
                    setSelectedType(result.data[0]._id);
                }
            })
            .catch(err => console.error(err));

        // Fetch maintenance records
        axios.get('http://localhost:3001/maintenance')
            .then(result => setMaintenance(result.data))
            .catch(err => console.error(err));

        // Fetch maintenance balances
        axios.get('http://localhost:3001/maintenanceBal')
            .then(result => {
                const balanceMap = {};
                result.data.forEach(payment => {
                    if (!balanceMap[payment.maintenance]) {
                        balanceMap[payment.maintenance] = 0;
                    }
                    balanceMap[payment.maintenance] += payment.amtPaid;
                });
                setBalances(balanceMap);
            })
            .catch(err => console.error(err));
    }, []);

    const handleDeleteClick = (rec) => {
        setSelectedRecord(rec);
        setShowModal(true);
    };

    const confirmDelete = () => {
        if (selectedRecord) {
            axios.delete(`http://localhost:3001/deleteMaintenance/${selectedRecord._id}`)
                .then(() => {
                    setShowModal(false);
                    setMaintenance(prev => prev.filter(rec => rec._id !== selectedRecord._id));
                    setSelectedRecord(null);
                })
                .catch(err => console.error(err));
        }
    };

    const cancelDelete = () => {
        setShowModal(false);
        setSelectedRecord(null);
    };

    const showDetails = (rec) => {
        setSelectedRecord(rec);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedRecord(null);
    };

    const displayedUnitTypeName = (unitType) => {
        return unitType === "UpNDown" ? "Up & Down" : unitType === "StudioType" ? "Studio-type" : unitType || "Unknown";
    };

    const groupedMaintenance = unitTypes.reduce((acc, unitType) => {
        const typeName = displayedUnitTypeName(unitType.unitType);
        acc[unitType._id] = {
            name: typeName,
            records: maintenance.filter(record => {
                const unit = units.find(u => u._id === record.unit);
                return unit && unit.unitType === unitType._id;
            }),
        };
        return acc;
    }, {});

    const getUnitInfo = (unitId) => {
        const unit = units.find(u => u._id === unitId);
        if (unit) {
            const unitType = unitTypes.find(type => type._id === unit.unitType);
            return `${unitType ? unitType.unitType : "Unknown"} - ${unit.unitNumber}`;
        }
        return "Unknown Unit";
    };

    const formatDueDate = (dateString) => {
        const date = new Date(dateString);
        return isNaN(date)
            ? "N/A"
            : new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).format(date);
    };

    const calculateBalance = (maintenance) => {
        const totalPaid = balances[maintenance._id] || 0;
        return maintenance.cost - totalPaid;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "orange";
            case "Ongoing":
                return "red";
            case "Completed":
                return "green";
            default:
                return "black";
        }
    };

    const filteredMaintenance = selectedUnit
        ? maintenance.filter(record => record.unit === selectedUnit)
        : groupedMaintenance[selectedType]?.records || [];

    return (
        <div className="tenant-container">
            <div className="tenant-content">
                <Link to="/newmaintenance" className="btn btn-success me-2"><FaPlus /></Link>
                <div className="btn-group mb-3">
                    {unitTypes.map(unitType => (
                        <button
                            key={unitType._id}
                            className={`btn ${selectedType === unitType._id ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => {
                                setSelectedType(unitType._id);
                                setSelectedUnit(null); // Reset unit selection when changing unit type
                            }}
                        >
                            {displayedUnitTypeName(unitType.unitType)}
                        </button>
                    ))}
                </div>
                <div className="dropdown mb-3">
                <label>Filter by Unit Number:</label>
                    <select
                        className="form-select"
                        value={selectedUnit || ""}
                        onChange={(e) => setSelectedUnit(e.target.value || null)}
                    >
                        <option value="">All Units</option>
                        {units
                            .filter(unit => unit.unitType === selectedType)
                            .map(unit => (
                                <option key={unit._id} value={unit._id}>
                                    {getUnitInfo(unit._id)}
                                </option>
                            ))}
                    </select>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Unit</th>
                            <th>Maintenance</th>
                            <th>Cost</th>
                            <th>Due</th>
                            <th>Balance</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMaintenance.map(record => (
                            <tr key={record._id}>
                                <td>{getUnitInfo(record.unit)}</td>
                                <td>{record.maintenanceType}</td>
                                <td>₱{record.cost.toFixed(2)}</td>
                                <td>{formatDueDate(record.dueDate)}</td>
                                <td>₱{calculateBalance(record).toFixed(2)}</td>
                                <td style={{ color: getStatusColor(record.status) }}>{record.status}</td>
                                <td>
                                    <Link to={`/editMaintenance/${record._id}`} className="btn btn-success me-2"><FaEdit /></Link>
                                    <button className="btn btn-danger me-2" onClick={() => handleDeleteClick(record)}>
                                        <FaTrash />
                                    </button>
                                    <button className="btn btn-info me-2" onClick={() => showDetails(record)}>
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h5>Confirm Deletion</h5>
                            <p>Are you sure you want to delete this maintenance record? This action cannot be undone.</p>
                            <div className="modal-actions">
                                <button className="btn btn-danger me-2" onClick={confirmDelete}>Delete</button>
                                <button className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
                {showDetailsModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={closeDetailsModal}>&times;</span>
                            <h3>Maintenance Record Details</h3>
                            <p><strong>Unit:</strong> {getUnitInfo(selectedRecord.unit)}</p>
                            <p><strong>Maintenance Description:</strong> {selectedRecord.maintenanceType}</p>
                            <p><strong>Maintenance Date Start:</strong> {formatDueDate(selectedRecord.dateStart)}</p>
                            <p><strong>Maintenance Date End:</strong> {formatDueDate(selectedRecord.dateEnd)}</p>
                            <p><strong>Cost:</strong> {selectedRecord.cost.toFixed(2)}</p>
                            <p><strong>Due Date:</strong> {formatDueDate(selectedRecord.dueDate)}</p>
                            <p><strong>Remarks:</strong> {selectedRecord.remarks}</p>
                            <p><strong>Status:</strong> <span style={{ color: getStatusColor(selectedRecord.status) }}>{selectedRecord.status}</span></p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Maintenance;
