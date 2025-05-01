import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./User.css";
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

function Units() {
    const [units, setUnits] = useState([]);
    const [unitTypes, setUnitTypes] = useState([]);
    const [und, setUND] = useState();
    const [st, setST] = useState();
    const [contracts, setContracts] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [unitNumberFilter, setUnitNumberFilter] = useState(""); // Unit number filter

    useEffect(() => {
        axios.get("http://localhost:3001/unit")
            .then(result => setUnits(result.data))
            .catch(err => console.log(err));

        axios.get("http://localhost:3001/unittype")
            .then(result => {
                setUnitTypes(result.data);
                if (result.data.length > 0) {
                    setSelectedType(result.data[0]._id);
                }
                const upNDown = result.data.find(type => type.unitType === "UpNDown");
                const studioType = result.data.find(type => type.unitType === "StudioType");

                setUND(upNDown || null);
                setST(studioType || null);
            })
            .catch(err => console.log(err));

        axios.get('http://localhost:3001/contract')
            .then(result => setContracts(result.data))
            .catch(err => console.log(err));
    }, []);

    const handleDeleteClick = (unit) => {
        setSelectedUnit(unit);
        setShowModal(true);
    };

    const confirmDelete = () => {
        if (selectedUnit) {
            axios.delete(`http://localhost:3001/deleteUnit/${selectedUnit._id}`)
                .then(res => {
                    console.log(res);
                    setShowModal(false);
                    setUnits(prev => prev.filter(unit => unit._id !== selectedUnit._id));
                })
                .catch(err => console.log(err));
        }
    };

    const cancelDelete = () => {
        setShowModal(false);
        setSelectedUnit(null);
    };

    const getContractId = (unitId) => {
        const contract = contracts.find(contract => contract.unit === unitId);
        return contract ? contract._id : null;
    };

    const hasTenant = (unitId) => {
        return contracts.some(contract => contract.unit === unitId);
    };

    const displayedUnitTypeName = (unitType) => {
        return unitType === "UpNDown" ? "Up & Down" : unitType === "StudioType" ? "Studio-type" : unitType;
    };

    const groupedUnits = unitTypes.reduce((acc, unitType) => {
        const typeName = displayedUnitTypeName(unitType.unitType);
        acc[unitType._id] = {
            name: typeName,
            units: units.filter(unit => unit.unitType === unitType._id),
        };
        return acc;
    }, {});

    // Filter the units based on the dropdown selection
    const filteredUnits = groupedUnits[selectedType]?.units.filter(unit =>
        unitNumberFilter === "" || unit.unitNumber.toString() === unitNumberFilter
    ) || [];

    return (
        <div className="contract-container">
            <div className="contract-content">
                <Link to="/unittype" className="btn btn-success"><FaPlus /> Add Type</Link>
                {selectedType && (
                    <Link to={`/unit/${selectedType}`} className="btn btn-success ms-2"><FaPlus /> Add Unit</Link>
                )}
                <div className="btn-group mb-3">
                    {unitTypes.map(unitType => (
                        <button
                            key={unitType._id}
                            className={`btn ${selectedType === unitType._id ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setSelectedType(unitType._id)}
                        >
                            {displayedUnitTypeName(unitType.unitType)}
                        </button>
                    ))}
                </div>

                {/* Dropdown for Unit Number Filter */}
                <div className="mb-3">
                    <label>Filter by Unit Number:</label>
                    <select
                        className="form-control"
                        value={unitNumberFilter}
                        onChange={(e) => setUnitNumberFilter(e.target.value)}
                    >
                        <option value="">All Units</option>
                        {groupedUnits[selectedType]?.units
                            .map(unit => (
                                <option key={unit._id} value={unit.unitNumber}>
                                    {unit.unitNumber}
                                </option>
                            ))}
                    </select>
                </div>

                <div className="table-scroll">
                    <table className="table mt-2">
                        <thead>
                            <tr>
                                <th>Unit No.</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUnits.length > 0 ? (
                                filteredUnits
                                    .sort((a, b) => a.unitNumber - b.unitNumber)
                                    .map(unit => {
                                        const contractId = getContractId(unit._id);
                                        const isUpAndDownRestricted = unit.unitType === und?._id && (unit.unitNumber >= 1 && unit.unitNumber <= 6);
                                        const isStudioTypeRestricted = unit.unitType === st?._id && (unit.unitNumber >= 1 && unit.unitNumber <= 10);
                                        return (
                                            <tr key={unit._id}>
                                                <td>{unit.unitNumber}</td>
                                                <td>{unit.rentAmount}</td>
                                                <td>
                                                    <Link to={`/editUnit/${unit._id}`} className="btn btn-primary me-2">
                                                        <FaEdit />
                                                    </Link>
                                                    {!hasTenant(unit._id) && (
                                                        !isUpAndDownRestricted && !isStudioTypeRestricted ? (
                                                            <button className="btn btn-danger" onClick={() => handleDeleteClick(unit)}>
                                                                <FaTrash />
                                                            </button>
                                                        ) : null
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center">
                                        No units found for this type.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {showModal && (
                        <div className="modal">
                            <div className="modal-content">
                                <h5>Confirm Deletion</h5>
                                <p>Are you sure you want to delete unit number {selectedUnit?.unitNumber}? This action cannot be undone.</p>
                                <div className="modal-actions">
                                    <button className="btn btn-danger me-2" onClick={confirmDelete}>Delete</button>
                                    <button className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Units;
