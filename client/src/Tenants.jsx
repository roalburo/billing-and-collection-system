import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Tenants.css";
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

function Tenants() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]); // For displaying filtered tenants
    const [searchQuery, setSearchQuery] = useState(""); // Search query state
    const [selectedUser, setSelectedUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [contracts, setContracts] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3001/users')
            .then(result => {
                const formattedUsers = result.data.map(user => ({
                    ...user,
                    dateOfBirth: new Date(user.dateOfBirth).toLocaleDateString('en-US')
                }));
                setUsers(formattedUsers);
                setFilteredUsers(formattedUsers); // Initialize filtered users
            })
            .catch(err => console.log(err));

        const fetchContracts = async () => {
            try {
                const activeContracts = await axios.get('http://localhost:3001/contract');
                const expiredContracts = await axios.get('http://localhost:3001/expiredcontract');
                const combinedContracts = [...activeContracts.data, ...expiredContracts.data];
                setContracts(combinedContracts);
            } catch (err) {
                console.error('Error fetching contracts:', err);
            }
        };
        fetchContracts();
    }, []);

    const confirmDelete = (user) => {
        setUserToDelete(user);
    };

    const handleDelete = () => {
        if (userToDelete) {
            axios
                .delete("http://localhost:3001/deleteUser/" + userToDelete._id)
                .then((res) => {
                    console.log(res);
                    setUsers(users.filter((user) => user._id !== userToDelete._id));
                    setFilteredUsers(filteredUsers.filter((user) => user._id !== userToDelete._id)); // Update filtered list
                    setUserToDelete(null);
                })
                .catch((err) => console.log(err));
        }
    };

    const closeDeleteModal = () => {
        setUserToDelete(null);
    };

    const showDetails = (user) => {
        setSelectedUser(user);
    };

    const closeModal = () => {
        setSelectedUser(null);
    };

    const hasContract = (userId) => {
        return contracts.some((contract) => contract.tenant === userId);
    };

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter users by name only
        const filtered = users.filter(user =>
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(query)
        );

        setFilteredUsers(filtered);
    };

    return (
        <div className="tenant-container">
            <div className="tenant-content">
                <div className="actions-container">
                    <Link to="/create" className="btn btn-success mb-3"> <FaPlus /> Add Tenant</Link>
                    {/* Search Input */}
                    <input
                        type="text"
                        className="form-control search-bar"
                        placeholder="Search by tenant name"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="table-scroll">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact No.</th>
                                <th>Email</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.lastName}, {user.firstName}</td>
                                    <td>{user.contactNumber}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <Link to={`/update/${user._id}`} className="btn btn-success me-2"> <FaEdit /> </Link>
                                        {!hasContract(user._id) && (
                                            <button className="btn btn-danger me-2" onClick={() => confirmDelete(user)}>
                                                <FaTrash />
                                            </button>
                                        )}
                                        <button className="btn btn-info" onClick={() => showDetails(user)}> Details </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {selectedUser && (
                        <div className="modal">
                            <div className="modal-content">
                                <span className="close" onClick={closeModal}>&times;</span>
                                <h3>Tenant Details</h3>
                                <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
                                <p><strong>Date of Birth:</strong> {selectedUser.dateOfBirth}</p>
                                <p><strong>Gender:</strong> {selectedUser.gender}</p>
                                <p><strong>Contact Number:</strong> {selectedUser.contactNumber}</p>
                                <p><strong>Current Address:</strong> {selectedUser.currentAddress}</p>
                                <p><strong>Emergency Contact:</strong> {selectedUser.emergencyName} - {selectedUser.emergencyNumber}</p>
                            </div>
                        </div>
                    )}
                    {userToDelete && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>Confirm Deletion</h3>
                                <p>Are you sure you want to delete{" "}<strong>{userToDelete.firstName} {userToDelete.lastName}</strong>? This action cannot be undone.</p>
                                <div className="modal-actions">
                                    <button className="btn btn-danger me-2" onClick={handleDelete}>
                                        Confirm
                                    </button>
                                    <button className="btn btn-secondary" onClick={closeDeleteModal}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Tenants;
