import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import "./AccountManagement.css";

function AccountManagement() {
  const [userData, setUserData] = useState({ name: '', email: '', password: '' });
  const [newData, setNewData] = useState({ name: '', email: '', password: '' });
  const [modalType, setModalType] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    if (!userId) {
        console.error('User ID is undefined or missing');
        return;
    }

    axios.get('http://localhost:3001/getAccount/'+userId)
      .then(response => {
        const data = response.data || { name: '', email: '', password: '' };
        setUserData({
          name: data.name || '',
          email: data.email || '',
          password: data.password || ''
        });
        setNewData({
          name: data.name || '',
          email: data.email || '',
          password: data.password || ''
        });
      })
      .catch(err => console.error(err));
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleUpdate = () => {
    axios.put(`http://localhost:3001/updateAccount/${userId}`, newData)
      .then(() => {
        alert('Account updated successfully');
        setUserData(newData);
        setModalType(null);
      })
      .catch(err => console.error(err));
  };

  const handleDelete = () => {
    axios.delete(`http://localhost:3001/deleteAccount/${userId}`)
      .then(() => {
        alert('Account deleted successfully');
        localStorage.removeItem('authToken');
        navigate('/register');
      })
      .catch(err => console.error(err));
  };

  const openModal = (type) => setModalType(type);
  const closeModal = () => {
    setModalType(null);
    setConfirmPassword('');
  };

  const handleConfirm = () => {
    if (confirmPassword === userData.password) {
      handleUpdate();
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="account-container">
      <div className='account-content'>
        <h2>Manage Your Account</h2>
        <div>
        <p onClick={() => openModal('name')} className="clickable">Edit Username</p>
        <p onClick={() => openModal('email')} className="clickable">Edit Email</p>
        <p onClick={() => openModal('password')} className="clickable">Edit Password</p>
        <p onClick={() => openModal('delete')} className="clickable text-danger">Delete Account</p>
        </div>
        {modalType && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            {modalType !== 'delete' && (
              <>
                <h3>Edit {modalType === 'name' ? 'Username' : modalType === 'email' ? 'Email' : 'Password'}</h3>
                <input
                  type={modalType === 'password' ? 'password' : 'text'}
                  name={modalType}
                  value={newData[modalType]}
                  onChange={handleChange}
                  className="form-control mb-3"
                />
                <h4>Confirm Password</h4>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control mb-3"
                />
                <button onClick={handleConfirm} className="btn btn-primary">Confirm</button>
              </>
            )}
            {modalType === 'delete' && (
              <>
                <h3>Delete Account</h3>
                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control mb-3"
                />
                <button onClick={handleDelete} className="btn btn-danger">Delete</button>
              </>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default AccountManagement;