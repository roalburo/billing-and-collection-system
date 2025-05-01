import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from 'axios';

function CreateContractRenewal() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [unit, setUnit] = useState({});
    const [unitTypes, setUnitTypes] = useState();
    const [tenants, setTenants] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState("");
    const [dateOfContract, setDateOfContract] = useState('');
    const [startDate, setStartDate] = useState('');
    const [durationInMonths, setDurationInMonths] = useState('');
    // const [endDate, setEndDate] = useState('');
    const [monthlyRent, setMonthlyRent] = useState('');
    const [advance, setAdvance] = useState('');
    const [securityDeposit, setSecurityDeposit] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const location = useLocation();

    useEffect(() => {
        axios.get(`http://localhost:3001/getUnit/${id}`)
            .then(result => {
                const unitData = result.data;
                setUnit(unitData);
                const rentAmount = unitData.rentAmount;
                    setMonthlyRent(rentAmount);
                    setAdvance(rentAmount);
                    setSecurityDeposit(rentAmount);
            })
            .catch(err => console.error('Error fetching unit:', err));

        axios.get(`http://localhost:3001/unittype`)
            .then(result => {
                const unitData = result.data;
                setUnitTypes(unitData);
            })
            .catch(err => console.error('Error fetching unit types:', err));

        axios.get(`http://localhost:3001/users`)
            .then(result => {
                setTenants(result.data);
            })
            .catch(err => console.error('Error fetching tenants:', err));
    }, [id]);

    useEffect(() => {
        if (location.state) {
            const duration = calculateDuration(location.state.startDate, location.state.endDate);
            setSelectedTenant(location.state.tenantId || "");
            setDateOfContract(location.state.dateOfContract || "");
            setStartDate(location.state.startDate || "");
            // setEndDate(location.state.endDate || "");
            setDurationInMonths(duration || "");
        }
    }, [location.state]);

    const calculateEndDate = () => {
        if (!startDate || !durationInMonths) return '';
        const start = new Date(startDate);
        start.setMonth(start.getMonth() + parseInt(durationInMonths, 10));
        return start.toISOString().split('T')[0];
    };

    const calculateDuration = (s,e) => {
        if (!s || !e) return '';
        const start = new Date(s);
        const end = new Date(e);
        const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        return diffInMonths;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const today = new Date();
        const start = new Date(startDate);
        const endDate = calculateEndDate();
        const end = new Date(endDate);

        if (!startDate) {
            setError("Start date is required.");
            return;
        }

        if (start < today) {
            setError('Start Date not allowed. Date must not precede the current day.');
            return;
        }

        // if (end < start) {
        //     setError('End date cannot be before the start date.');
        //     return;
        // }

        // const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        // if (diffInMonths < 6) {
        //     setError('Rental duration must be at least 6 months.');
        //     return;
        // }

        if (durationInMonths < 6) {
            setError('Rent duration must be at least 6 months.');
            return;
        }

        if (!durationInMonths) {
            setError('Duration is required.');
            return;
        }

        setError('');
        const contractData = {
            unit: id,
            tenant: selectedTenant,
            dateOfContract,
            startDate,
            endDate,
            monthlyRent,
            advance,
            securityDeposit
        };

        axios.post("http://localhost:3001/createContract", contractData)
            .then(result => {
                console.log('Contract created:', result);
                navigate('/contracts');
            })
            .catch(err => console.error('Error creating contract:', err));
    };

    return (
        <div className='contract-container'>
            <div className='contract-content'>
                <form onSubmit={handleSubmit}>
                    <h1>Contract Registration</h1>
                    <h2>Unit {unit.unitNumber}</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className='mb-2'>
                        <label htmlFor="tenant">Tenant</label>
                        <select
                            id="tenant"
                            className='form-control'
                            value={selectedTenant}
                            onChange={(e) => setSelectedTenant(e.target.value)} required
                        >
                            <option value="">Select Tenant</option>
                            {tenants.map((tenant) => (
                                <option key={tenant._id} value={tenant._id}>
                                    {tenant.lastName}, {tenant.firstName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-2">
                        <label htmlFor="dateOfContract">Date of Contract</label>
                        <input
                            type="date"
                            id="dateOfContract"
                            className='form-control'
                            value={dateOfContract}
                            onChange={(e) => setDateOfContract(e.target.value)} required
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="startDate">Rent Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            className='form-control'
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)} required
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="durationInMonths">Rent Duration (in Months)</label>
                        <input
                            type="number"
                            id="durationInMonths"
                            className='form-control'
                            value={durationInMonths}
                            onChange={(e) => setDurationInMonths(e.target.value)} required
                        />
                    </div>
                    <div className='mb-2'>
                        <label>Calculated Rent End Date</label>
                        <input
                            type="text"
                            className='form-control'
                            value={calculateEndDate()}
                            readOnly
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="monthlyRent">Monthly Rent</label>
                        <input
                            type="text"
                            id="monthlyRent"
                            className='form-control'
                            value={monthlyRent}
                            readOnly
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="advance">Advance</label>
                        <input
                            type="text"
                            id="advance"
                            className='form-control'
                            value={advance}
                            readOnly
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="securityDeposit">Security Deposit</label>
                        <input
                            type="text"
                            id="securityDeposit"
                            className='form-control'
                            value={securityDeposit}
                            readOnly
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit" className='btn btn-success me-2'>Save</button>
                        <button type="button" className='btn btn-secondary' onClick={() => setShowModal(true)}>Cancel</button>
                    </div>
                </form>
                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h5>Confirm Cancellation</h5>
                            <p>Cancelling this renewal means the contract will remain ended, 
                            and the information from the renewal will not be accessible again. 
                            Are you sure you want to proceed?</p>
                            <div className="modal-actions">
                                <button className="btn btn-danger me-2" onClick={() => {
                                    setShowModal(false);
                                    navigate('/contracts');
                                }}>Confirm</button>
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreateContractRenewal;