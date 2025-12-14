import React, { useEffect, useState } from 'react'
import { apiCall } from '../../config';

export default function ManageWallet(props) {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [amount, setAmount] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await apiCall('/get/users');
            const fetchedUsers = data.body || [];
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
        setLoading(false);
    };

    const handleAddWallet = async () => {
        if(selectedUsers.length === 0 || amount === 0) {
            alert('Please select user and enter amount');
            return;
        }
        try {
            const result = await apiCall('/add/wallet', {
                body: { users: selectedUsers, amount: parseInt(amount) }
            });
            if (result.message === 'Wallets added successfully') {
                let updatedUsers = [...users];
                updatedUsers.forEach(user => {
                    if(selectedUsers.includes(user.email)) {
                        user.wallet += parseInt(amount);
                    }
                });
                setUsers(updatedUsers);
                setAmount(0);
                setSelectedUsers([]);
            } else {
                alert('Failed to add wallet');
            }
        } catch (error) {
            console.error("Error adding wallet:", error);
        }
    }

    const handleEmptyWallet = async () => {
        if(selectedUsers.length === 0) {
            alert('Please select user');
            return;
        }
        try {
            const result = await apiCall('/remove/wallet', {
                body: { users: selectedUsers }
            });
            if (result.message === 'Wallets removed successfully') {
                let updatedUsers = [...users];
                updatedUsers.forEach(user => {
                    if(selectedUsers.includes(user.email)) {
                        user.wallet = 0;
                    }
                });
                setUsers(updatedUsers);
                setSelectedUsers([]);
            } else {
                alert('Failed to empty wallet');
            }
        } catch (error) {
            console.error("Error emptying wallet:", error);
        }
    }

  return (
    <div className="manage-details">
        <nav aria-label="breadcrumb" className="breadcrumb-container">
            <ol className="breadcrumb d-flex">
                <li className="breadcrumb-item active" aria-current="page" onClick={() => props.setActivePage('admin')}>
                    / Admin
                </li>
                <li className="breadcrumb-item active breadcrumb-secondary" aria-current="page">
                    Manage Wallet
                </li>
            </ol>
        </nav>

        {loading && <p>Loading users...</p>}

        {!loading && users.length > 0 && (
            <div>
                <div className="wallet-form">
                    <div className="form-group">
                        <label htmlFor="amount">Amount:</label>
                        <input type="number" className="form-control" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        <button className="btn btn-warning" disabled={!selectedUsers.length || !amount} onClick={handleAddWallet}>Add Money</button>
                        <button className="btn btn-danger" disabled={!selectedUsers.length} onClick={handleEmptyWallet}>Empty Wallet</button>
                    </div>
                    {/* checkbox for users */}
                    <div className="form-group mt-3">
                        <input type="checkbox" id="select-all" onChange={(e) => {
                            if (e.target.checked) {
                                setSelectedUsers(users.map((user) => user.email));
                            } else {
                                setSelectedUsers([]);
                            }
                        }
                        } />
                        <label className='ms-2' htmlFor="select-all">Select All</label>
                        {/* search bar */}
                        <input type="text" className="form-control mt-2" placeholder="Search user" onChange={(e) => setSearch(e.target.value)} />
                        {users.filter(user => {
                            if (!search) return user;
                            return user.email.toLowerCase().includes(search.toLowerCase());
                        }).map((user) => (
                            <div key={user.email} className='my-2'>
                                <input type="checkbox" checked={selectedUsers.includes(user.email)} id={user.email} onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedUsers([...selectedUsers, user.email]);
                                    } else {
                                        setSelectedUsers(selectedUsers.filter((selectedUser) => selectedUser !== user.email));
                                    }
                                }} />
                                <label className="form-check-label ms-2" htmlFor={user.email}>{user.email} - (₹{user.wallet})</label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            )}
    </div>
  )
}
