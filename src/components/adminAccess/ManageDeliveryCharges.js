import React, { useState, useEffect } from 'react'; 
import { Accordion, Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { apiCall } from '../../config';

const ManageDeliveryCharges = (props) => {
  const [areaDetails, setAreaDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedAreaDetails, setUpdatedAreaDetails] = useState({});
  const [locations, setLocations] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('danger');
  const [show, setShow] = useState(true);
  const [newArea, setNewArea] = useState({ location: '', delivery_fee: '', area_name: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchAreaDetails();
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const fetchAreaDetails = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/get/delivery_charges');
      const fetchedAreaDetails = data.body || [];

      setAreaDetails(fetchedAreaDetails);

      let locRes = await apiCall('/get/location');
      let allLoc = locRes.body || [];
      allLoc = allLoc?.map(loc => loc.name);
      setLocations(allLoc);

      const updatedDetails = {};
      fetchedAreaDetails.forEach(area => {
        updatedDetails[area.area_id] = {
          area_name: area.area_name,
          delivery_fee: area.delivery_fee,
        };
      });
      setUpdatedAreaDetails(updatedDetails);

    } catch (error) {
      console.error("Error fetching area details:", error);
    }
    setLoading(false);
  };

  const handleInputChange = (area_id, key, value) => {
    setUpdatedAreaDetails({
      ...updatedAreaDetails,
      [area_id]: {
        ...updatedAreaDetails[area_id],
        [key]: value,
      },
    });
  };

  const handleNewAreaInputChange = (key, value) => {
    setNewArea({
      ...newArea,
      [key]: value,
    });
  };

  const handleSaveNewArea = async () => {
    try {
      const result = await apiCall('/add/delivery_fee', {
        body: {
          city: newArea.area_name,
          delivery_fee: newArea.delivery_fee,
          location: newArea.location
        }
      });
      result = result.body || [];
      setAlertMessage('Area added successfully');
      setAlertType('success');
      setShow(true);
      setNewArea({ location: '', delivery_fee: '', area_name: '' });
      setShowAddForm(false); 
      setAreaDetails(result);
      const newAreaId = result.find(area => area.area_name === newArea.area_name)?.area_id; // Find the new area's id
      setUpdatedAreaDetails(prevDetails => ({
        ...prevDetails,
        [newAreaId]: {
          area_name: newArea.area_name,
          delivery_fee: newArea.delivery_fee,
        }
      }));
    } catch (error) {
      console.error("Error adding area:", error);
      setAlertMessage("Error adding area");
      setAlertType('danger');
      setShow(true);
    }
  };

  const handleEdit = async (area_id) => {
    try {
      const result = await apiCall('/update/delivery_fee', {
        body: {
          areaDetails: updatedAreaDetails[area_id],
          area_id: area_id
        }
      });
      if (result.message === 'Area details updated') {
        setAreaDetails(result.body || []);
        setAlertMessage('Area updated successfully');
        setAlertType('success');
        setShow(true);
      }
    } catch (error) {
      console.error("Error saving area details:", error);
      setAlertMessage("Error uploading image:", error);
      setAlertType('danger');
      setShow(true);
    }
  };

  const handleDelete = async (area_id) => {
    try {
      const result = await apiCall('/delete/delivery_charges', {
        body: { area_id: area_id }
      });
      if (result.message === 'Area deleted') {
        setAlertMessage("Area deleted successfully");
        setAlertType('success');
        setShow(true);
        setAreaDetails(result.body || []);
      }
    } catch (error) {
      setAlertMessage("Error deleting area:", error);
      setAlertType('danger');
      setShow(true);
    }
  };

  const addDeliveryCharge = () => {
    setShowAddForm(true);
  };

  const groupBylocation = (areaDetails) => {
    const grouped = [];

    areaDetails?.forEach(area => {
      let locationGroup = grouped.find(group => group[area.location]);

      if (!locationGroup) {
        locationGroup = { [area.location]: [] };
        grouped.push(locationGroup);
      }
      locationGroup[area.location].push(area);
    });    
    return grouped;
  };

  const groupedLocs = groupBylocation(areaDetails);

  return (
    <>
    <div className="manage-delivery-charge">
      <nav aria-label="breadcrumb" className="breadcrumb-container">
        <ol className="breadcrumb d-flex">
          <li className="breadcrumb-item active" aria-current="page" onClick={() => props.setActivePage('admin')}>
            / Admin
          </li>
          <li className="breadcrumb-item active breadcrumb-secondary" aria-current="page">
            Manage Delivery Charge
          </li>
        </ol>
      </nav>

      {loading && <p>Loading area details...</p>}
      {!loading && areaDetails.length > 0 && (
        <Accordion defaultActiveKey="0">
          {groupedLocs?.map((loc, index) => {
            const locationName = Object.keys(loc)[0];
            const areas = loc[locationName];
            
            return (
              <Accordion.Item eventKey={`${index}`} key={index}>
                <Accordion.Header>{locationName}</Accordion.Header>
                <Accordion.Body>
                  <div className="d-flex justify-content-between">
                    <Button className='ms-0 mb-4' variant="success" onClick={() => addDeliveryCharge()}>
                      Add Delivery Charge
                    </Button>
                  </div>
                  {showAddForm && (
                    <div className="mt-4">
                      <h5>Add New Delivery Charge</h5>
                      <Form.Group controlId="formLocation">
                        <Form.Label>Location</Form.Label>
                        <Form.Select 
                          value={newArea.location}
                          onChange={(e) => handleNewAreaInputChange('location', e.target.value)}
                        >
                          <option value="">Select Location</option>
                          {locations.map((loc, index) => (
                            <option key={index} value={loc}>{loc}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      
                      <Form.Group controlId="formAreaName" className="mt-3">
                        <Form.Label>Area Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={newArea.area_name}
                          onChange={(e) => handleNewAreaInputChange('area_name', e.target.value)}
                        />
                      </Form.Group>
                      
                      <Form.Group controlId="formDeliveryFee" className="mt-3">
                        <Form.Label>Delivery Fee</Form.Label>
                        <Form.Control
                          type="text"
                          value={newArea.delivery_fee}
                          onChange={(e) => handleNewAreaInputChange('delivery_fee', e.target.value)}
                        />
                      </Form.Group>

                      <Button className="mt-3" variant="success" onClick={handleSaveNewArea}>
                        Save
                      </Button>
                    </div>
                  )}
                  {areas.map((area) => (
                    <div key={area.area_id} className="mb-4">
                      <InputGroup className="mb-3">
                        <InputGroup.Text className="custom-details">Area Name</InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={updatedAreaDetails[area.area_id]?.area_name || ''}
                          onChange={(e) => handleInputChange(area.area_id, 'area_name', e.target.value)}
                        />
                      </InputGroup>

                      <InputGroup className="mb-3">
                        <InputGroup.Text className="custom-details">Delivery Fee</InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={updatedAreaDetails[area.area_id]?.delivery_fee || ''}
                          onChange={(e) => handleInputChange(area.area_id, 'delivery_fee', e.target.value)}
                        />
                      </InputGroup>

                      <div className="d-flex justify-content-between">
                        <Button variant="secondary" onClick={() => handleEdit(area.area_id)}>
                          Edit
                        </Button>
                        <Button variant="danger" onClick={() => handleDelete(area.area_id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}
      {!loading && areaDetails.length === 0 && <p>No area details found.</p>}

    </div>
    {alertMessage && show && (
      <Alert className='alertMsg' variant={alertType} onClose={() => setShow(false)} dismissible>
        {alertMessage}
      </Alert>
    )}
    </>
  );
};

export default ManageDeliveryCharges;
