import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Contracts.css";
import { FaEdit, FaTrashAlt, FaRedo } from "react-icons/fa";

function Contracts() {
    const [units, setUnits] = useState([]);
    const [unitTypes, setUnitTypes] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [maintenance, setMaintenance] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [selectedUnitNumber, setSelectedUnitNumber] = useState(""); // State for filtering by unit number
    const [selectedContract, setSelectedContract] = useState(null);
    const [contractToEnd, setContractToEnd] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("http://localhost:3001/unit")
            .then((result) => setUnits(result.data))
            .catch((err) => console.log(err));

        axios
            .get("http://localhost:3001/unittype")
            .then((result) => {
                setUnitTypes(result.data);
                if (result.data.length > 0) {
                    setSelectedType(result.data[0]._id);
                }
            })
            .catch((err) => console.log(err));

        axios
            .get("http://localhost:3001/contract")
            .then((result) => setContracts(result.data))
            .catch((err) => console.log(err));

        axios
            .get("http://localhost:3001/users")
            .then((result) => setTenants(result.data))
            .catch((err) => console.log(err));

        axios
            .get("http://localhost:3001/maintenance")
            .then((result) => setMaintenance(result.data))
            .catch((err) => console.log(err));
    }, []);

    const getTenantName = (tenantId) => {
        const tenant = tenants.find((tenant) => tenant._id === tenantId);
        return tenant ? `${tenant.lastName}, ${tenant.firstName}` : "-";
    };

    const getContractById = (unitId) => {
        return contracts.find((contract) => contract.unit === unitId);
    };

    const displayedUnitTypeName = (unitType) => {
        return unitType === "UpNDown"
            ? "Up & Down"
            : unitType === "StudioType"
            ? "Studio-type"
            : unitType;
    };

    const groupedUnits = unitTypes.reduce((acc, unitType) => {
        const typeName = displayedUnitTypeName(unitType.unitType);
        const unitsForType = units.filter(
            (unit) => unit.unitType?.toString() === unitType._id?.toString()
        );

        acc[typeName] = {
            units: unitsForType,
            id: unitType._id,
        };
        return acc;
    }, {});

    const handleEndContract = () => {
        if (!contractToEnd) return;
        axios
            .delete(`http://localhost:3001/deleteContract/${contractToEnd._id}`)
            .then(() => {
                setContracts(
                    contracts.filter(
                        (contract) => contract._id !== contractToEnd._id
                    )
                );
                setContractToEnd(null);
                setShowModal(false);
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to end contract");
            });
    };

    const confirmEndContract = (contract) => {
        setContractToEnd(contract);
        setShowModal(true);
    };

    const filteredUnits = Object.entries(groupedUnits).reduce(
        (acc, [typeName, group]) => {
            if (group.id === selectedType) {
                acc = group.units.filter(
                    (unit) =>
                        selectedUnitNumber === "" ||
                        unit.unitNumber.toString() === selectedUnitNumber
                );
            }
            return acc;
        },
        []
    );

    return (
        <div className="contract-container">
            <div className="contract-content">
                <Link to="/expiredcontracts" className="btn btn-primary mb-3">
                    View Expired Contracts
                </Link>
                <div className="btn-group mb-3">
                    {unitTypes.map((unitType) => (
                        <button
                            key={unitType._id}
                            className={`btn ${
                                selectedType === unitType._id
                                    ? "btn-primary"
                                    : "btn-secondary"
                            }`}
                            onClick={() => setSelectedType(unitType._id)}
                        >
                            {displayedUnitTypeName(unitType.unitType)}
                        </button>
                    ))}
                </div>

                {/* Dropdown to filter by Unit Number */}
                <div className="mb-3">
                    <label htmlFor="unitNumberFilter">
                        Filter by Unit Number:
                    </label>
                    <select
                        id="unitNumberFilter"
                        className="form-control"
                        value={selectedUnitNumber}
                        onChange={(e) => setSelectedUnitNumber(e.target.value)}
                    >
                        <option value="">All Units</option>
                        {units
                            .filter((unit) => unit.unitType === selectedType)
                            .map((unit) => (
                                <option
                                    key={unit._id}
                                    value={unit.unitNumber.toString()}
                                >
                                    {unit.unitNumber}
                                </option>
                            ))}
                    </select>
                </div>

                <div className="table-scroll">
                    <table className="table mt-2">
                        <thead>
                            <tr>
                                <th>Unit Number</th>
                                <th>Tenant</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUnits.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center">
                                        No units found for this type.
                                    </td>
                                </tr>
                            ) : (
                                filteredUnits
                                    .sort(
                                        (a, b) =>
                                            a.unitNumber - b.unitNumber
                                    )
                                    .map((unit) => {
                                        const contract =
                                            getContractById(unit._id);
                                        const contractId = contract?._id;
                                        return (
                                            <tr key={unit._id}>
                                                <td>{unit.unitNumber}</td>
                                                <td>
                                                    {getTenantName(
                                                        contract?.tenant
                                                    )}
                                                </td>
                                                <td>
                                                    {contractId ? (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    setSelectedContract(
                                                                        contract
                                                                    )
                                                                }
                                                                className="btn btn-info me-2"
                                                            >
                                                                Details
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    confirmEndContract(
                                                                        contract
                                                                    )
                                                                }
                                                                className="btn btn-danger me-2"
                                                            >
                                                                <FaTrashAlt />{" "}
                                                                End
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <Link
                                                            to={`/contract/${unit._id}`}
                                                            className="btn btn-primary me-2"
                                                        >
                                                            Register
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Confirm End Contract</h3>
                        <p>
                            Are you sure you want to end this contract? This
                            action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button
                                onClick={handleEndContract}
                                className="btn btn-danger me-2"
                            >
                                Proceed
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn btn-secondary me-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedContract && (
                <div className="modal">
                    <div className="modal-content">
                        <span
                            className="close"
                            onClick={() => setSelectedContract(null)}
                        >
                            &times;
                        </span>
                        <h3>Contract Details</h3>
                        <p>
                            <strong>Contract ID:</strong>{" "}
                            {selectedContract._id}
                        </p>
                        <p>
                            <strong>Monthly Rent:</strong> ₱
                            {selectedContract.monthlyRent}
                        </p>
                        {/* Add more contract details as needed */}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Contracts;
