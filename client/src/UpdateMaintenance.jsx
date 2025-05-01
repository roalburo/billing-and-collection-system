import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';

function UpdateMaintenance() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [units, setUnits] = useState([]);
    const [unitTypes, setUnitTypes] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState();
    const [maintenanceType, setMaintenanceType] = useState();
    const [dateStart, setDateStart] = useState();
    const [dateEnd, setDateEnd] = useState();
    const [cost, setCost] = useState();
    const [remarks, setRemarks] = useState();
    const [status, setStatus] = useState();
    const [dueDate, setDueDate] = useState();
    const [error, setError] = useState();

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        axios.get(`http://localhost:3001/unit`)
            .then(result => setUnits(result.data))
            .catch(err => console.error('Error fetching units:', err));

        axios.get(`http://localhost:3001/unittype`)
            .then(result => setUnitTypes(result.data))
            .catch(err => console.error('Error fetching unit types:', err));

        axios.get(`http://localhost:3001/getMaintenance/${id}`)
        .then(result => {
            const data = result.data;
            setSelectedUnit(data.unit || "");
            setMaintenanceType(data.maintenanceType || "");
            setDateStart(formatDate(data.dateStart));
            setDateEnd(formatDate(data.dateEnd));
            setCost(data.cost || "");
            setDueDate(formatDate(data.dueDate));
            setRemarks(data.remarks || "");
            setStatus(data.status || "Pending");
        })
        .catch(err => console.error('Error fetching maintenance record:', err));
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const today = new Date();
        const start = new Date(dateStart);
        const end = new Date(dateEnd);
        const due = new Date(dueDate);

        if (due < today) {
            setError('Due Date not allowed. Date must not precede the current day.');
            return;
        }

        if (start < today) {
            setError('Start Date not allowed. Date must not precede the current day.');
            return;
        }

        if (end < start) {
            setError('End date cannot be before the start date.');
            return;
        }

        setError('');
        const updatedData = {
            unit: selectedUnit,
            maintenanceType,
            dateStart,
            dateEnd,
            cost,
            dueDate,
            remarks,
            status
        };

        axios.put(`http://localhost:3001/updateMaintenance/${id}`, updatedData)
            .then(() => {
                navigate('/maintenance');
            })
            .catch(err => console.error('Error updating record:', err));
    };

    return (
        <div className='contract-container'>
            <div className='contract-content'>
                <form onSubmit={handleSubmit}>
                    <h1>Update Maintenance Record</h1>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className='mb-2'>
                        <label htmlFor="unit">Unit</label>
                        <select id="unit" className='form-control' value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} required>
                            <option value="">Select Unit</option>
                            {units.map((unit) => {
                                const unitType = unitTypes.find((ut) => ut._id === unit.unitType);
                                const unitDisplay = unitType ? `${unitType.unitType} - ${unit.unitNumber}` : unit.unitNumber;
                                return (
                                    <option key={unit._id} value={unit._id}>
                                        {unitDisplay}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="mb-2">
                        <label htmlFor="maintenanceType">Maintenance Type</label>
                        <input type="text" id="maintenanceType" className='form-control' value={maintenanceType}
                            onChange={(e) => setMaintenanceType(e.target.value)} required />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="dateStart">Maintenance Date Start</label>
                        <input type="date" id="dateStart" className='form-control' value={dateStart}
                            onChange={(e) => setDateStart(e.target.value)} />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="dateEnd">Maintenance Date End</label>
                        <input type="date" id="dateEnd" className='form-control' value={dateEnd}
                            onChange={(e) => setDateEnd(e.target.value)} />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="cost">Cost</label>
                        <input type="number" id="cost" className='form-control' value={cost}
                            onChange={(e) => setCost(e.target.value)} required />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="dueDate">Payment Due</label>
                        <input type="date" id="dueDate" className='form-control' value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)} required />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="remarks">Remarks</label>
                        <input type="text" id="remarks" className='form-control' value={remarks}
                            onChange={(e) => setRemarks(e.target.value)} required />
                    </div>
                    <div className="mb-2">
                    <label htmlFor="status">Status</label>
                        <select id="status" className='form-control' value={status} onChange={(e) => setStatus(e.target.value)} required>
                            <option value="Pending">Pending</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div className="button-group">
                        <button type="submit" className='btn btn-success me-2'>Save</button>
                        <button type="button" className='btn btn-secondary' onClick={() => navigate('/maintenance')}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateMaintenance;
