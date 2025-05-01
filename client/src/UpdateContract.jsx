import React, {useState, useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios'

function UpdateContract () {
    const {id} = useParams()
    const [unit, setUnit] = useState({})
    const [tenants, setTenants] = useState([])
    const [selectedTenant, setSelectedTenant] = useState("")
    const [rentStart, setRentStart] = useState(new Date())
    const [rentEnd, setRentEnd] = useState(new Date())
    const [monthlyRent, setMonthlyRent] = useState()
    const [securityDeposit, setSecurityDeposit] = useState()
    const navigate = useNavigate()

    useEffect(()=> {
        axios.get('http://localhost:3001/getContract/'+id)
        .then(result => {
            const contract = result.data;
            setUnit(contract.unit)
            setSelectedTenant(contract.tenant)
            setRentStart(new Date(result.data.rentStart).toISOString().split('T')[0])
            setRentEnd(new Date(result.data.rentEnd).toISOString().split('T')[0])
            setMonthlyRent(contract.monthlyRent)
            setSecurityDeposit(contract.securityDeposit)
        })
        .catch(err => console.log(err))

        axios.get(`http://localhost:3001/users`)
        .then(result => {
            setTenants(result.data)
        })
        .catch(err => console.log(err))
    }, [id])

    const Update = (e) => {
        e.preventDefault();
        axios.put("http://localhost:3001/updateContract/"+id, {unit, tenant: selectedTenant, rentStart, rentEnd, monthlyRent, securityDeposit})
        .then(result => {
            console.log(result)
            navigate('/')
        })
        .catch(err => console.log(err))
    }

    return (
        <div className='contract-container'>
            <div className='user-content'>
                <form onSubmit={Update}>
                    <h2>Update Unit {unit.unitNumber} Tenant</h2>
                    <div className='mb-2'>
                        <label htmlFor="">Tenant</label>
                        <select id="tenant" className='form-control' value={selectedTenant} onChange={(e) => setSelectedTenant(e.target.value)}>
                            <option value="">Select Tenant</option>
                            {tenants.map((tenant) => (
                                <option key={tenant._id} value={tenant._id}>
                                    {tenant.lastName}{", "}{tenant.firstName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Rent Start Date</label>
                        <input type="date" className='form-control'
                        value={rentStart} onChange={(e) => setRentStart(e.target.value)}/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Rent End Date</label>
                        <input type="date" className='form-control'
                        value={rentEnd} onChange={(e) => setRentEnd(e.target.value)}/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Monthly Rent</label>
                        <input type="text" placeholder='Enter Amount' className='form-control'
                        value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)}/>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor="">Security Deposit</label>
                        <input type="text" placeholder='Enter Amount' className='form-control'
                        value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)}/>
                    </div>
                    <button className='btn btn-success'>Update</button>
                </form>
            </div>
        </div>
    )
}

export default UpdateContract;