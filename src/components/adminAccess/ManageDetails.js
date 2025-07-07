import React, { useState, useEffect } from 'react'; 
import { Button, Form, InputGroup } from 'react-bootstrap';

const ManageDetails = (props) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedDetails, setUpdatedDetails] = useState({});

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: "/contact/details" }),
      });
      const data = await response.json();
      const fetchedDetails = JSON.parse(data.body);

      // Set the details and initialize updatedDetails with values
      let initialDetails = fetchedDetails.map(data => ({
        key: data.key.trim(),
        value: data.value.trim()
      }));
      initialDetails = initialDetails.sort((a, b) => a.key.localeCompare(b.key));
      setDetails(initialDetails);

      const updated = {};
      initialDetails.forEach(detail => updated[detail.key] = detail.value);
      setUpdatedDetails(updated);  // Now updatedDetails is initialized correctly
    } catch (error) {
      console.error("Error fetching details:", error);
    }
    setLoading(false);
  };

  const handleInputChange = (key, value) => {
    setUpdatedDetails({
      ...updatedDetails,
      [key]: value
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ details: updatedDetails, path: "/update/details" }), 
      });
      const result = await response.json();
      if (result.message === 'Details updated') {
        console.log('Details updated successfully!');
      }
    } catch (error) {
      console.error("Error saving details:", error);
      console.log('Error updating details!');
    }
  };

  return (
    <div className="manage-details">
        <nav aria-label="breadcrumb" className="breadcrumb-container">
            <ol className="breadcrumb d-flex">
                <li className="breadcrumb-item active" aria-current="page" onClick={() => props.setActivePage('admin')}>
                    / Admin
                </li>
                <li className="breadcrumb-item active breadcrumb-secondary" aria-current="page">
                    Manage Details
                </li>
            </ol>
        </nav>
        
        {loading && <p>Loading details...</p>}

        {!loading && details.length > 0 && (
          <Form>
            {details.map((detail) => (
              <InputGroup key={detail.key} className="mb-3">
                <InputGroup.Text className='custom-details'>{detail.key.charAt(0).toUpperCase() + detail.key.slice(1)}</InputGroup.Text>
                <Form.Control
                  type="text"
                  value={updatedDetails[detail.key] || ''}
                  onChange={(e) => handleInputChange(detail.key, e.target.value)}
                />
              </InputGroup>
            ))}

            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </Form>
        )}

        {!loading && details.length === 0 && <p>No details found.</p>}
    </div>
  );
};

export default ManageDetails;
