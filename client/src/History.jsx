import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./Contracts.css";


function History() {
    const [units, setUnits] = useState([]);
    const [unitTypes, setUnitTypes] = useState([]);
    const [expiredcontracts, setExpiredContracts] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [selectedExpiredContract, setSelectedExpiredContract] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:3001/unit')
            .then(result => setUnits(result.data))
            .catch(err => console.log(err));

        axios.get('http://localhost:3001/unittype')
            .then(result => setUnitTypes(result.data))
            .catch(err => console.log(err));

        axios.get('http://localhost:3001/expiredcontract')
            .then(result => setExpiredContracts(result.data))
            .catch(err => console.log(err));

        axios.get('http://localhost:3001/users')
            .then(result => setTenants(result.data))
            .catch(err => console.log(err));
    }, []);

    const getTenantName = (tenantId) => {
        const tenant = tenants.find(tenant => tenant._id === tenantId);
        return tenant ? `${tenant.lastName}, ${tenant.firstName}` : "-";
    };

    const getUnitDetails = (unitId) => {
        const unit = units.find(unit => unit._id === unitId);
        if (unit) {
            const unitType = unitTypes.find(type => type._id === unit.unitType);
            return {
                number: unit.unitNumber,
                type: unitType ? displayedUnitTypeName(unitType.unitType) : "-"
            };
        }
        return { number: "-", type: "-" };
    };

    const displayedUnitTypeName = (unitType) => {
        return unitType === "UpNDown" ? "Up & Down" : unitType === "StudioType" ? "Studio-type" : unitType;
    };

    const calculateRentDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return 'N/A';
    
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        const yearDiff = end.getFullYear() - start.getFullYear();
        const monthDiff = end.getMonth() - start.getMonth();
    
        return yearDiff * 12 + monthDiff;
    };

    const showExpiredContractDetails = (contractId) => {
        const contract = expiredcontracts.find(c => c._id === contractId);
        if (contract) {
            setSelectedExpiredContract(contract);
        }
    };

    const closeModal = () => setSelectedExpiredContract(null);

    return (
        <div className="contract-container">
            <div className='contract-content'>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Expired Contracts</h3>
                <button
                    className="btn btn-light d-flex align-items-center"
                    onClick={() => navigate("/contracts")}
                >
                    <FaArrowLeft className="me-2" /> Back
                </button>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th>Tenant</th>
                        <th>Unit</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {expiredcontracts.map(contract => {
                        const tenantName = getTenantName(contract.tenant);
                        const { type, number } = getUnitDetails(contract.unit);

                        return (
                            <tr key={contract._id}>
                                <td>{tenantName}</td>
                                <td>{`${type} - ${number}`}</td>
                                <td>{new Date(contract.startDate).toLocaleDateString()}</td>
                                <td>{new Date(contract.endDate).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        className="btn btn-info"
                                        onClick={() => showExpiredContractDetails(contract._id)}
                                    >
                                        Details
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {selectedExpiredContract && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h3>Contract Details</h3>
                        <p><strong>Tenant:</strong> {getTenantName(selectedExpiredContract.tenant)}</p>
                        <p><strong>Unit:</strong> {`${getUnitDetails(selectedExpiredContract.unit).type} - ${getUnitDetails(selectedExpiredContract.unit).number}`}</p>
                        <p><strong>Date of Contract:</strong> {new Date(selectedExpiredContract.dateOfContract).toLocaleDateString()}</p>
                        <p><strong>Start Date:</strong> {new Date(selectedExpiredContract.startDate).toLocaleDateString()}</p>
                        <p><strong>Rent Duration:</strong> {calculateRentDuration(selectedExpiredContract.startDate, selectedExpiredContract.endDate)} months</p>
                        <p><strong>End Date:</strong> {new Date(selectedExpiredContract.endDate).toLocaleDateString()}</p>
                        <p><strong>Monthly Rent:</strong> ₱{selectedExpiredContract.monthlyRent}</p>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

export default History;