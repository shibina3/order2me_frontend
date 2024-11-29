import React from 'react';
import { Nav } from 'react-bootstrap';

const AdminDashboard = (props) => {

    const setPage = (page) => {
        props.setActivePage(page);
    }
    return (
        <div className="admin-dashboard">
        {/* toggle to turn on/off the app */}
        <div className="form-check form-switch d-flex justify-content-center align-items-center gap-3">
            <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" checked={props.appStatus === 'ON'} onChange={props.toggleAppStatus}/>
            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{props.appStatus === 'ON' ? 'App is ON' : 'App is OFF'}</label>
        </div>
        <nav aria-label="breadcrumb" className="breadcrumb-container">
            <ol className="breadcrumb">
            <li className="breadcrumb-item active breadcrumb-secondary" aria-current="page">/ Admin Dashboard</li>
            </ol>
        </nav>

        <div className="admin-buttons">
            <Nav.Link onClick={() => { setPage('manage-orders');}} className="bouncy-button">Manage Orders</Nav.Link>
            <Nav.Link onClick={() => { setPage('manage-categories');}} className="bouncy-button">Manage Categories</Nav.Link>
            <Nav.Link onClick={() => { setPage('manage-products');}} className="bouncy-button">Manage Products</Nav.Link>
            <Nav.Link onClick={() => { setPage('time_slots');}} className="bouncy-button">Manage Time Slots</Nav.Link>
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
