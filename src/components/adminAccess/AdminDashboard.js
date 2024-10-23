import React from 'react';
import { Nav } from 'react-bootstrap';

const AdminDashboard = (props) => {

    const setPage = (page) => {
        props.setActivePage(page);
    }
    return (
        <div className="admin-dashboard">
        <nav aria-label="breadcrumb" className="breadcrumb-container">
            <ol className="breadcrumb">
            <li className="breadcrumb-item active breadcrumb-secondary" aria-current="page">/ Admin Dashboard</li>
            </ol>
        </nav>

        <div className="admin-buttons">
            <Nav.Link onClick={() => { setPage('manage-orders');}} className="bouncy-button">Manage Orders</Nav.Link>
            <Nav.Link onClick={() => { setPage('manage-categories');}} className="bouncy-button">Manage Categories</Nav.Link>
            <Nav.Link onClick={() => { setPage('manage-products');}} className="bouncy-button">Manage Products</Nav.Link>
            <Nav.Link onClick={() => { setPage('manage-delivery-charges');}} className="bouncy-button">Manage Delivery Charges</Nav.Link>
            <Nav.Link onClick={() => { setPage('manage-locations');}} className="bouncy-button">Manage Locations</Nav.Link>
            {/* <Nav.Link onClick={() => { setPage('manage-banners');}} className="bouncy-button">Manage Banners</Nav.Link> */}
            <Nav.Link onClick={() => { setPage('manage-details');}} className="bouncy-button">Manage Details</Nav.Link>
            <Nav.Link onClick={() => { setPage('manage-access');}} className="bouncy-button">Manage Access</Nav.Link>
        </div>
        </div>
    );
};

export default AdminDashboard;
