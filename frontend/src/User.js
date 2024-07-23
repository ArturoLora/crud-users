import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function User() {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    
    useEffect(() => {
        if (!token) {
            navigate('/');
        } else {
            fetchUsers();
        }
    }, [navigate, token]);

    const handleApiError = (err) => {
        console.log(err);
        if (err.response.status === 401 || err.response.status === 403 || err.response.status === 404) {
            navigate('/');
        }
    };

    const fetchUsers = () => {
        axios.get('http://localhost:8081/', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setUsers(res.data))
            .catch(handleApiError);
    };

    const handleSelectUser = (id) => {
        setSelectedUsers(prevSelected => {
            const updatedSelection = new Set(prevSelected);
            updatedSelection.has(id) ? updatedSelection.delete(id) : updatedSelection.add(id);
            return updatedSelection;
        });
    };

    const handleUserAction = (action) => {
        if (action === 'delete' && !window.confirm('Are you sure you want to delete the selected users?')) return;

        axios.post(`http://localhost:8081/${action}`, { ids: [...selectedUsers] }, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                alert(res.data);
                fetchUsers();
                setSelectedUsers(new Set());
            })
            .catch(handleApiError);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className='d-flex vh-100 flex-column'>
            <div className='bg-white d-flex justify-content-between p-3'>
                <h2>User Management</h2>
                <button className='btn btn-danger' onClick={handleLogout}>Log Out</button>
            </div>
            <div className='bg-primary flex-fill d-flex justify-content-center align-items-center'>
                <div className='bg-white rounded p-3'>
                    <div className='mb-3 text-center'>
                        <button className='btn btn-danger mx-2' onClick={() => handleUserAction('block')}>Block</button>
                        <button className='btn btn-secondary mx-2' onClick={() => handleUserAction('unblock')}>Unblock</button>
                        <button className='btn btn-danger mx-2' onClick={() => handleUserAction('delete')}>Delete</button>
                    </div>
                    <div className='table-responsive'>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Last Login</th>
                                    <th>Registration Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.has(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                            />
                                        </td>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</td>
                                        <td>{new Date(user.registration_time).toLocaleString()}</td>
                                        <td>{user.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default User;
