import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleApiError = (err) => {
        if (err.response && err.response.status === 400) {
            alert('Registration failed: ' + err.response.data);
        } else {
            alert('An error occurred. Please try again.');
        }
        console.log(err);
    };

    const validateForm = () => {
        return name.trim() !== '' && email.trim() !== '' && password.trim() !== '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert('All fields are required.');
            return;
        }

        axios.post('http://localhost:8081/register', { name, email, password })
            .then(res => {
                alert(res.data);
                navigate('/'); // Redirect to login page
            })
            .catch(handleApiError);
    };

    return (
        <div className="d-flex vh-100 justify-content-center align-items-center bg-primary">
            <div className="w-50 bg-white rounded p-4">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Name</label>
                        <input
                            type="text"
                            id="name"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                    <button type="submit" className="btn btn-primary">Register</button>
                </form>
                <div className="mt-3">
                    <a href="/">Login</a>
                </div>
            </div>
        </div>
    );
}

export default Register;
