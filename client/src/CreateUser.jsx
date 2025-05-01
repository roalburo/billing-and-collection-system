import React, { useState } from "react";
import axios from 'axios'
import { useNavigate} from 'react-router-dom'

function CreateUser () {
    const [firstName, setFirstName] = useState()
    const [lastName, setLastName] = useState()
    const [dateOfBirth, setDateOfBirth] = useState(new Date())
    const [gender, setGender] = useState()
    const [email, setEmail] = useState()
    const [contactNumber, setContactNumber] = useState()
    const [currentAddress, setCurrentAddress] = useState()
    const [emergencyName, setEmergencyName] = useState()
    const [emergencyNumber, setEmergencyNumber] = useState()
    const [errorMessage, setErrorMessage] = useState('')
    const navigate = useNavigate()

    const validateContactNumber = (number) => {
        return number.length === 11;
    }

    const Submit = (e) => {
        e.preventDefault();
        if (!validateContactNumber(contactNumber)) {
            setErrorMessage('Contact number must be exactly 11 digits.');
            return;
        }
        if (!validateContactNumber(emergencyNumber)) {
            setErrorMessage('Emergency contact number must be exactly 11 digits.');
            return;
        }
        axios.post("http://localhost:3001/createUser", {firstName, lastName, dateOfBirth, gender, email, contactNumber, currentAddress, emergencyName, emergencyNumber})
        .then(result => {
            console.log(result)
            navigate('/tenants')
        })
        .catch(err => console.log('Error creating user:', err))
    }

    const handleCancel = () => {
        navigate('/tenants'); 
    }

    return (
        <div class='contract-container'>
            <div class='contract-content'>
                <form onSubmit={Submit}>
                    <h2>Register Tenant</h2>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <div className='mb-2'>
                        <label htmlFor="">First Name</label>
                        <input type="text" placeholder='Enter First Name' className='form-control'
                        onChange={(e) => setFirstName(e.target.value)} required/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Last Name</label>
                        <input type="text" placeholder='Enter Last Name' className='form-control'
                        onChange={(e) => setLastName(e.target.value)} required/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Date of Birth</label>
                        <input type="date" className='form-control'
                        onChange={(e) => setDateOfBirth(e.target.value)} required/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Gender</label>
                        <select id="gender" className='form-control' onChange={(e) => setGender(e.target.value)} required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Email</label>
                        <input type="email" placeholder='Enter Email' className='form-control'
                        onChange={(e) => setEmail(e.target.value)} required/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Contact Number</label>
                        <input type="number" placeholder='Enter Contact No' className='form-control'
                        onChange={(e) => setContactNumber(e.target.value)} required/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Current Address</label>
                        <input type="text" placeholder='Enter Current Address' className='form-control'
                        onChange={(e) => setCurrentAddress(e.target.value)} required/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Emergency Contact Person</label>
                        <input type="text" placeholder='Enter Name' className='form-control'
                        onChange={(e) => setEmergencyName(e.target.value)} required/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Emergency Contact Number</label>
                        <input type="number" placeholder='Enter Contact Number' className='form-control'
                        onChange={(e) => setEmergencyNumber(e.target.value)} required/>
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

export default CreateUser;