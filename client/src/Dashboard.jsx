import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Dashboard.css';
import companylogo from './images/csaresidences.png';

function Dashboard() {
    const navigate = useNavigate();

    const token = localStorage.getItem("authToken");
    let userId = null;

    if (token) {
        try {
            const decoded = jwtDecode(token);
            userId = decoded.id;
        } catch (error) {
            console.error("Error decoding JWT token", error);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate('/login');
    };

    const handleBillingNavigation = async () => {
        try {
            // Call the backend to refresh billing
            const response = await fetch('http://localhost:3001/refreshBilling', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            console.log('Billing refresh response:', data);

            // Navigate to the billing page after refreshing billing
            navigate('/billing');
        } catch (error) {
            console.error('Error refreshing billing:', error);
            alert('Failed to refresh billing. Please try again.');
        }
    };



    return (
        <div className="container-fluid">
            <div className="row">
                <div className="column">
                    <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
                        <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
                            <li className="liD"> 
                                <Link to="/" className="nav-link text-white px-0 align-middle">
                                    <span className="title">Dashboard</span>
                                </Link>
                            </li>
                            <li className="liD">
                                <Link to="/contracts" className="nav-link text-white px-0 align-middle">
                                    <span className="title">Contracts</span>
                                </Link>
                            </li>
                            <li className="liD">
                                <Link to="/tenants" className="nav-link text-white px-0 align-middle">
                                    <span className="title">Tenant Information</span>
                                </Link>
                            </li>
                            <li className="liD"> 
                                <button
                                    onClick={handleBillingNavigation}
                                    className="nav-link text-white px-0 align-middle"
                                    style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                                >
                                    <span className="title">Billing & Payment</span>
                                </button>
                            </li>

                            <li className="liD">
                                <Link to="/units" className="nav-link text-white px-0 align-middle">
                                    <span className="title">Unit Information</span>
                                </Link>
                            </li>
                            <li className="liD">
                                <Link to="/maintenance" className="nav-link text-white px-0 align-middle">
                                    <span className="title">Unit Maintenance</span>
                                </Link>
                            </li>
                            {userId && (
                                <li className="liD">
                                    <Link to={`/account/${userId}`} className="nav-link text-white px-0 align-middle">
                                        <span className="title">Account Management</span>
                                    </Link>
                                </li>
                            )}
                            <button onClick={handleLogout} className="btn btn-danger mt-4" style={{ marginLeft: '20px' }}>Logout</button>
                        </ul>
                    </div>
                </div>
                <div className="head">
                    <div className="logo">
                        <img src={companylogo} alt="Company Logo" />
                    </div>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;