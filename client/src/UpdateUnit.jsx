import React, { useEffect, useState } from "react";
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

function UpdateUnit () {
    const { id } = useParams();
    const [unitNumber, setUnitNumber] = useState()
    const [unitType, setUnitType] = useState()
    const [rentAmount, setRentAmount] = useState()
    const navigate = useNavigate()
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        axios.get(`http://localhost:3001/getUnit/${id}`)
            .then(result => {
                const unitData = result.data;
                setUnitType(unitData.unitType);
                setUnitNumber(unitData.unitNumber);
                setRentAmount(unitData.rentAmount);
            })
            .catch(err => console.error('Error fetching unit:', err));
    }, [id]);

    const Submit = (e) => {
        e.preventDefault();
        
        if (!unitNumber || isNaN(unitNumber)) {
            alert("Please enter a valid number for Unit Number");
            return;
        }
        if (rentAmount <= 0) {
            setErrorMessage("Rent amount must be a positive number.");
            return;
        }
        if (rentAmount < 1000) {
            setErrorMessage("Rent amount cannot be less than Php 1,000.");
            return;
        }
        if (rentAmount > 99999) {
            setErrorMessage("Rent amount cannot exceed Php 99,999.");
            return;
        }

        axios.put(`http://localhost:3001/updateUnit/${id}`, {unitType, unitNumber, rentAmount})
            .then(() => {
                navigate('/units');
            })
            .catch(err => {
                console.error("Error updating unit:", err);
                setErrorMessage("Error updating unit. Please try again.");
            });
    }

    const handleCancel = () => {
        navigate('/units');
    }

    return (
        <div className='contract-container'>
            <div className='contract-content'>
                <form onSubmit={Submit}>
                    <h2>Edit Apartment Unit</h2>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                    {/* <div className='mb-2'>
                        <label htmlFor="">Unit Type</label>
                        <input type="text" id="unitType" className='form-control' value={unitType} readOnly/>
                    </div> */}
                    <div className='mb-2'>
                        <label htmlFor="">Unit Number</label>
                        <input type="number" id="unitNumber" className='form-control' value={unitNumber}
                        onChange={(e) => setUnitNumber(e.target.value)} required/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Rent Price</label>
                        <input type="number" id="rentAmount" className='form-control' value={rentAmount}
                        onChange={(e) => setRentAmount(e.target.value)} required/>
                    </div>
                    
                    <div className="button-group">
                        <button type="submit" className='btn btn-success me-2'>Save</button>
                        <button type="button" className='btn btn-secondary' onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UpdateUnit;