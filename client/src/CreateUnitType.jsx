import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateUnitType() {
    const [unitType, setUnitType] = useState();
    const [unitTypes, setUnitTypes] = useState([]);
    const [units, setUnits] = useState([]);
    const [customUnitType, setCustomUnitType] = useState('');
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        axios.get('http://localhost:3001/unit')
            .then(result => setUnits(result.data))
            .catch(err => console.log(err));

        axios.get('http://localhost:3001/unittype')
            .then(result => setUnitTypes(result.data))
            .catch(err => console.log(err));
    }, []);

    const Submit = (e) => {
        e.preventDefault();

        if (isDeleteMode) {
            const selectedUnitType = unitTypes.find(type => type._id === unitType);
            if (!selectedUnitType) {
                setErrorMessage("Invalid unit type selected.");
                return;
            }

            const hasUnits = units.some(unit => unit.unitType === selectedUnitType._id);
            if (hasUnits) {
                setErrorMessage("Cannot delete unit type. There are units associated with this type.");
                return;
            }
            axios.delete(`http://localhost:3001/deleteUnitType/${unitType}`)
                .then(response => {
                    console.log(response);
                    navigate('/units');
                })
                .catch(err => {
                    console.log(err);
                    setErrorMessage("Failed to delete unit type. Please try again.");
                });
        } else {
            const finalUnitType = unitType === "Other" ? customUnitType : unitType;
            axios.get(`http://localhost:3001/unitExists/${finalUnitType}`)
                .then(response => {
                    if (response.data.exists) {
                        setErrorMessage("Unit type already exists. Please create a new unit type.");
                    } else {
                        axios.post("http://localhost:3001/createUnitType", { unitType: finalUnitType })
                            .then(result => {
                                console.log(result);
                                navigate('/units');
                            })
                            .catch(err => console.log(err));
                    }
                })
                .catch(err => console.log(err));
        }
    };

    const handleCancel = () => {
        navigate('/units');
    };

    return (
        <div className='contract-container'>
            <div className='contract-content'>
                <form onSubmit={Submit}>
                    <h2>{isDeleteMode ? "Delete Unit Type" : "New Unit Type"}</h2>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                    <div className='mb-2'>
                        <label htmlFor="unitType">Unit Type</label>
                        <select id="unitType" className='form-control' onChange={(e) => setUnitType(e.target.value)} required>
                            <option value="">Select Type</option>
                            {isDeleteMode ? (
                                unitTypes.map(type => (
                                    <option key={type._id} value={type._id}>
                                        {type.unitType}
                                    </option>
                                ))
                            ) : (
                                <>
                                    <option value="UpNDown">Up & Down</option>
                                    <option value="StudioType">Studio-type</option>
                                    <option value="Other">Other</option>
                                </>
                            )}
                        </select>
                    </div>

                    {unitType === "Other" && !isDeleteMode && (
                        <div className='mb-2'>
                            <label htmlFor="customUnitType">Enter Custom Unit Type</label>
                            <input
                                type="text"
                                id="customUnitType"
                                className='form-control'
                                value={customUnitType}
                                onChange={(e) => setCustomUnitType(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="mb-2">
                        <label htmlFor="deleteMode" className="form-check-label">
                            <input
                                type="checkbox"
                                id="deleteMode"
                                className="form-check-input"
                                checked={isDeleteMode}
                                onChange={() => {
                                    setIsDeleteMode(!isDeleteMode);
                                    setErrorMessage('');
                                }}
                            />
                            Enable Delete Mode
                        </label>
                    </div>

                    <div className="button-group">
                        <button type="submit" className={`btn ${isDeleteMode ? 'btn-danger' : 'btn-success'} me-2`}>
                            {isDeleteMode ? "Delete" : "Save"}
                        </button>
                        <button type="button" className='btn btn-secondary' onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateUnitType;