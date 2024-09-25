import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Card, Form, Button } from 'react-bootstrap';

const MyProfile = () => {
  // Initialize state with default or stored values
  const [profile, setProfile] = useState({
    name: localStorage.getItem('name') || '',
    email: localStorage.getItem('email') || '',
    phone: localStorage.getItem('phone') || '',
    address: localStorage.getItem('address') || ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
    setIsSaveEnabled(true); // Enable the save button when any change is made
  };

  // Handle save button click
  const handleSave = () => {
    Object.keys(profile).forEach((key) => {
      localStorage.setItem(key, profile[key]);
    });
    setIsSaveEnabled(false); // Disable the save button after saving
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={6} className="text-center">
          <Image 
            src="/assets/avatar.jpeg" // Replace with actual image source
            roundedCircle 
            className="mb-4"
          />
          <h4 className="mb-3">{profile.name}</h4>
          <Card className="p-3">
            <Form>
              <Form.Group className='mb-2' controlId="formName">
                <Form.Label className='content-primary'>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className='mb-2' controlId="formEmail">
                <Form.Label className='content-primary'>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className='mb-2' controlId="formPhone">
                <Form.Label className='content-primary'>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className='mb-4' controlId="formAddress">
                <Form.Label className='content-primary'>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                />
              </Form.Group>
              <Button 
                variant="danger" 
                onClick={handleSave} 
                disabled={!isSaveEnabled}
              >
                Save
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MyProfile;
