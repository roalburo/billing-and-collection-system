import React, {useState, useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios'
import "./Contracts.css";

function UpdateUser () {
    const {id} = useParams()
    const [firstName, setFirstName] = useState()
    const [lastName, setLastName] = useState()
    const [dateOfBirth, setDateOfBirth] = useState(new Date())
    const [gender, setGender] = useState()
    const [email, setEmail] = useState()
    const [contactNumber, setContactNumber] = useState()
    const [currentAddress, setCurrentAddress] = useState()
    const [emergencyName, setEmergencyName] = useState()
    const [emergencyNumber, setEmergencyNumber] = useState()
    const navigate = useNavigate()

    useEffect(()=> {
        axios.get('http://localhost:3001/getUser/'+id)
        .then(result => {
            setFirstName(result.data.firstName)
            setLastName(result.data.lastName)
            const formattedDate = new Date(result.data.dateOfBirth).toISOString().split('T')[0];
            setDateOfBirth(formattedDate)
            setGender(result.data.gender)
            setEmail(result.data.email)
            setContactNumber(result.data.contactNumber)
            setCurrentAddress(result.data.currentAddress)
            setEmergencyName(result.data.emergencyName)
            setEmergencyNumber(result.data.emergencyNumber)
        })
        .catch(err => console.log(err))
    }, [])

    const Update = (e) => {
        e.preventDefault();
        axios.put("http://localhost:3001/updateUser/"+id, {firstName, lastName, dateOfBirth, gender, email, contactNumber, currentAddress, emergencyName, emergencyNumber})
        .then(result => {
            console.log(result)
            navigate('/tenants')
        })
        .catch(err => console.log(err))
    }

    return (
        <div className='contract-container'>
            <div className='contract-content'>
                <form onSubmit={Update}>
                    <h2>Update Tenant Information</h2>
                    <div className='mb-2'>
                        <label htmlFor="">First Name</label>
                        <input type="text" placeholder='Enter First Name' className='form-control'
                        value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Last Name</label>
                        <input type="text" placeholder='Enter Last Name' className='form-control'
                        value={lastName} onChange={(e) => setLastName(e.target.value)}/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Date of Birth</label>
                        <input type="date" className='form-control'
                        value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Gender</label>
                        <select id="gender" className='form-control' value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Email</label>
                        <input type="email" placeholder='Enter Email' className='form-control'
                        value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Contact Number</label>
                        <input type="text" placeholder='Enter Contact No' className='form-control'
                        value={contactNumber} onChange={(e) => setContactNumber(e.target.value)}/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Current Address</label>
                        <input type="text" placeholder='Enter Current Address' className='form-control'
                        value={currentAddress} onChange={(e) => setCurrentAddress(e.target.value)}/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Emergency Contact Person</label>
                        <input type="text" placeholder='Enter Name' className='form-control'
                        value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)}/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Emergency Contact Number</label>
                        <input type="text" placeholder='Enter Contact Number' className='form-control'
                        value={emergencyNumber} onChange={(e) => setEmergencyNumber(e.target.value)}/>
                    </div>
                    <div className="button-group">
                        <button className='btn btn-success me-2'>Update</button>
                        <button type="button" className='btn btn-secondary' onClick={() => navigate('/tenants')}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UpdateUser;