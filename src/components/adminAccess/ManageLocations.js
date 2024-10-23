import React, { useState, useEffect } from 'react';
import { Button, ListGroup, Form, InputGroup } from 'react-bootstrap';

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
        const getLocRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({path: "/get/location" }),
          });
          let getLocData = await getLocRes.json();
          getLocData = JSON.parse(getLocData?.body || []);
      setLocations(getLocData);
      setLoading(false);
    }, 1000); 
  };

  const handleAddLocation = async () => {
    if (!newLocation) {
      alert('Please enter a location name');
      return;
    }
    const addLocRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({path: "/add/location", name: newLocation }),
    });
    let addLocData = await addLocRes.json();
    if (addLocData.message === "Location Added") {
      setLocations([...locations, { id: locations.length + 1, name: newLocation }]);
      setNewLocation(''); 
      setShowAddLocationForm(false);
    }
  };

  const handleDeleteLocation = async (id) => {
    const deleteLocRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id, path: "/delete/location" }),
    });
    let deleteLocData = await deleteLocRes.json();
    deleteLocData = JSON.parse(deleteLocData.message);
    if (deleteLocData.message === "Location Deleted") {
      setLocations(locations.filter(location => location.id !== id));
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
