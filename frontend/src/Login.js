import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const showAlert = (message) => {
        alert(message);
    };

    const handleApiError = (err) => {
        if (err.response) {
            const { status } = err.response;
            if (status === 403) {
                showAlert('Your account is blocked. Please contact support.');
            } else if (status === 401) {
                showAlert('Invalid credentials. Please try again.');
            } else {
                showAlert('An error occurred. Please try again.');
            }
        } else {
            showAlert('An error occurred. Please try again.');
        }
        console.log(err);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post('http://localhost:8081/login', { email, password })
            .then(res => {
                localStorage.setItem('token', res.data.token);
                navigate('/user'); 
            })
            .catch(handleApiError);
    };

    return (
        <div className="d-flex vh-100 justify-content-center align-items-center bg-primary">
            <div className="w-50 bg-white rounded p-4">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
                <div className="mt-3">
                    <a href="/register">Register</a>
                </div>
            </div>
        </div>
    );
}

export default Login;
