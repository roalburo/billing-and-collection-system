import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function Login() {
    const [loginInput, setLoginInput] = useState();
    const [password, setPassword] = useState();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/login', { loginInput, password })
        .then(result => {
            console.log(result);
            if (result.data.token) {
                localStorage.setItem("authToken", result.data.token);
                navigate('/');

                const token = result.data.token;
                axios.get('http://localhost:3001/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(response => console.log(response.data))
                .catch(error => console.error(error));
            }
        }).catch(err => console.log(err));
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="bg-white p-3 rounded w-25">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="loginInput">
                            <strong>Username or Email</strong>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Username or Email"
                            autoComplete="off"
                            name="loginInput"
                            className="form-control rounded-0"
                            onChange={(e) => setLoginInput(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password">
                            <strong>Password</strong>
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            name="password"
                            className="form-control rounded-0"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-success w-100 rounded-0">
                        Login
                    </button>
                </form>
                <p>Don't Have an Account?</p>
                <Link to="/register" className="btn btn-success w-100 rounded-0">
                    Sign Up
                </Link>
            </div>
        </div>
    );
}

export default Login;