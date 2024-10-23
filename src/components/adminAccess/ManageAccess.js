import React, { useState, useEffect } from 'react';
import { Table, Button, Form } from 'react-bootstrap';

const ManageAccess = (props) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: "/get/users" }),
      });
      const data = await response.json();
      setUsers(JSON.parse(data.body)); 
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, role, value) => {
    try {
      const updateUserRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId, role, value, path: "/change/roles" }),
      });
      const result = await updateUserRes.json();
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
        const updateUserRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: userId, path: "/delete/user" }),
        });
        const result = await updateUserRes.json();
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
