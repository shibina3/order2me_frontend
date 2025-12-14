import React, { useState, useEffect } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { apiCall } from '../../config';

const ManageAccess = (props) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/get/users');
      setUsers(data.body || []); 
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, role, value) => {
    try {
      const result = await apiCall('/change/roles', {
        body: { id: userId, role, value }
      });
      if (result.message === 'User role updated') {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, [role]: value } : user
        ));
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleAdminChange = (userId, isAdmin) => {
    handleRoleChange(userId, 'admin', isAdmin);
  };

  const handleDeliveryPartnerChange = (userId, isDeliveryPartner) => {
    handleRoleChange(userId, 'delivery_partner', isDeliveryPartner);
  };

  const handleDeleteUser = async (userId) => {
    try {
        const result = await apiCall('/delete/user', {
          body: { id: userId }
        });
        if (result.message === 'User deleted') {
          setUsers(users.filter(user => 
            user.id !== userId 
          ));
        }
      } catch (error) {
        console.error("Error deleting user :", error);
      }
  }

  return (
    <div className="manage-access">
        <nav aria-label="breadcrumb" className="breadcrumb-container">
            <ol className="breadcrumb d-flex">
            <li className="breadcrumb-item active" aria-current="page" onClick={() => props.setActivePage('admin')}>
                / Admin
            </li>
            <li className="breadcrumb-item active breadcrumb-secondary" aria-current="page">
                Manage Access
            </li>
            </ol>
        </nav>
      {loading && <p>Loading users...</p>}
      {!loading && users.length === 0 && <p>No users found.</p>}

      {!loading && users.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Admin Access</th>
              <th>Delivery Partner Access</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.mobile}</td>
                <td>
                  <Form.Check 
                    type="checkbox"
                    label="Admin"
                    checked={user.admin}
                    onChange={(e) => handleAdminChange(user.id, e.target.checked)}
                  />
                </td>
                <td>
                  <Form.Check 
                    type="checkbox"
                    label="Delivery Partner"
                    checked={user.delivery_partner}
                    onChange={(e) => handleDeliveryPartnerChange(user.id, e.target.checked)}
                  />
                </td>
                <td>
                  <Button 
                    variant="danger" 
                    onClick={() => handleDeleteUser(user.id)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ManageAccess;
