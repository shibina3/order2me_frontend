import React, { useState, useEffect } from 'react';
import { Button, ListGroup, Form, InputGroup } from 'react-bootstrap';
import { apiCall } from '../../config';

const ManageLocations = (props) => {
  const [locations, setLocations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showAddLocationForm, setShowAddLocationForm] = useState(false);
  const [newLocation, setNewLocation] = useState(''); 

  const setPage = (page) => {
    props.setActivePage(page);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = () => {
    setTimeout(async () => {
        try {
          const getLocRes = await apiCall('/get/location');
          let getLocData = getLocRes.body || [];
      setLocations(getLocData);
        } catch (error) {
          console.error("Error fetching locations:", error);
        }
      setLoading(false);
    }, 1000); 
  };

  const handleAddLocation = async () => {
    if (!newLocation) {
      alert('Please enter a location name');
      return;
    }
    try {
      const addLocData = await apiCall('/add/location', {
        body: { name: newLocation }
    });
    if (addLocData.message === "Location Added") {
      setLocations([...locations, { id: locations.length + 1, name: newLocation }]);
      setNewLocation(''); 
      setShowAddLocationForm(false);
      }
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };

  const handleDeleteLocation = async (id) => {
    try {
      const deleteLocData = await apiCall('/delete/location', {
        body: { id: id }
    });
    if (deleteLocData.message === "Location Deleted") {
      setLocations(locations.filter(location => location.id !== id));
      }
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  return (
    <div className="manage-locations">
      <nav aria-label="breadcrumb" className="breadcrumb-container">
        <ol className="breadcrumb d-flex">
          <li 
            className="breadcrumb-item active" 
            aria-current="page" 
            onClick={() => { setPage('admin'); }} 
          >
            / Admin
          </li>
          <li 
            className="breadcrumb-item active breadcrumb-secondary" 
            aria-current="page"
          >
            Manage Locations
          </li>
        </ol>
      </nav>

      <Button
        variant="success"
        onClick={() => setShowAddLocationForm(!showAddLocationForm)}
        className="mb-3 mt-4"
      >
        {showAddLocationForm ? 'Cancel' : '+ Add New Location'}
      </Button>

      {showAddLocationForm && (
        <InputGroup className="mb-3">
          <Form.Control
            type="text"
            placeholder="Enter location name"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
          />
            <Button variant="primary" onClick={handleAddLocation} className='mt-0'>
                Add
            </Button>
        </InputGroup>
      )}

      {loading && <p>Loading locations...</p>}

      {locations.length === 0 && !loading && (
        <p>No locations found. Click on "Add" to add a new location.</p>
      )}

      {locations.length > 0 && (
        <ListGroup>
          {locations.map((location) => (
            <ListGroup.Item key={location.id} className="d-flex justify-content-between align-items-center">
              {location.name}
              <div>
                <Button variant="danger" onClick={() => handleDeleteLocation(location.id)}>
                  Delete
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default ManageLocations;
