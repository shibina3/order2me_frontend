import React, { useState, useEffect } from 'react';
import { Button, ListGroup, Form, InputGroup, Accordion, Alert } from 'react-bootstrap';
import AWS from 'aws-sdk';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

const ManageCategories = (props) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('danger');
  const [show, setShow] = useState(true);
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetchCategories();
    setLoading(false);
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const fetchCategories = async () => {
    const allCategoriesRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ path: "/get/categories" }),
    });
    let allCategories = await allCategoriesRes.json();
    allCategories = JSON.parse(allCategories.body);
    allCategories = allCategories.sort((a, b) => a.id - b.id);

    const groupedCategories = allCategories.reduce((acc, category) => {
      acc[category.location] = acc[category.location] || [];
      acc[category.location].push(category);
      return acc;
    }, {});    

    setCategories(groupedCategories);

    let locRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: "/get/location" }),
    });
    let allLoc = await locRes.json();
    allLoc = JSON.parse(allLoc.body);
    allLoc = allLoc?.map(loc => loc.name);
    setLocations(allLoc);
  };

  const uploadImageToS3 = async (file) => {
    const s3 = new AWS.S3({
      accessKeyId: "AKIAZDZTB5RQFRIRMYHM",
      secretAccessKey: "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",
      region: 'us-east-1',
    });
    const params = {
      Bucket: 'order2me.in',
      Key: `categories/${location}/${file.name}`,
      Body: file,
      ContentType: file.type,
    };
    return s3.upload(params).promise();
  };

  const handleAddCategory = async () => {
    if (!newCategory || !newDescription || !newImage || !location) {
      alert('Please enter all details');
      return;
    }

    // Upload image to S3
    let uploadedImage;
    try {
      uploadedImage = await uploadImageToS3(newImage);
    } catch (error) {
      setAlertMessage("Error uploading image:", error);
      setAlertType('danger');
      setShow(true);
      console.error("Error uploading image:", error);
      return;
    }

    // Add new category
    const addCategoryRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: "/add/categories",
        name: newCategory,
        description: newDescription,
        image_url: uploadedImage.Location,
        location: location,
      }),
    });

    let addCategoryData = await addCategoryRes.json();
    if (addCategoryData.message === "Category Added") {
      fetchCategories();
      setNewCategory('');
      setNewDescription('');
      setNewImage(null);
      setLocation(''); 
      setShowAddCategoryForm(false);
    }
    setAlertType('success');
    setAlertMessage(`${newCategory} added successfully`);
    setShow(true);
  };

  const handleDeleteCategory = async (id) => {
    const deleteCategoryRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id, path: "/delete/categories" }),
    });
    let deleteCategoryData = await deleteCategoryRes.json();
    if (deleteCategoryData.message === "Category Deleted") {
      fetchCategories();
      setAlertType('success');
      setAlertMessage(`Category removed successfully`);
      setShow(true);
    }
  };

  const handleReorderCategories = async (locationKey, reorderedCategories) => {

    const updateOrderRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({order: reorderedCategories, path: "/update/categories_order"}),
    });
    let updateOrderData = await updateOrderRes.json();
    if (updateOrderData.message === "Categories Order Updated") {
      setCategories((prev) => ({
        ...prev,
        [locationKey]: reorderedCategories,
      }));
    }
  }

  const onDragEnd = (result, locationKey) => {
    if (!result.destination) return; 

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    let reorderedCategories = Array.from(categories[locationKey]);
    const [movedItem] = reorderedCategories.splice(sourceIndex, 1);
    reorderedCategories.splice(destinationIndex, 0, movedItem);
    reorderedCategories = reorderedCategories.map((category, index) => ({
      ...category,
      id: index + 1,
    }));    

    handleReorderCategories(locationKey, reorderedCategories);
  };

  return (
    <>
      <div className="manage-categories">
        <nav aria-label="breadcrumb" className="breadcrumb-container">
          <ol className="breadcrumb d-flex">
            <li className="breadcrumb-item active" aria-current="page" onClick={() => props.setActivePage('admin')}>
              / Admin
            </li>
            <li className="breadcrumb-item active breadcrumb-secondary" aria-current="page">
              Manage Categories
            </li>
          </ol>
        </nav>

        <Button
          variant="success"
          onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
          className="mb-3 mt-4"
        >
          {showAddCategoryForm ? 'Cancel' : '+ Add New Category'}
        </Button>

        {showAddCategoryForm && (
          <div>
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </InputGroup>
            <InputGroup className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter category description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </InputGroup>
            <InputGroup className="mb-3">
              <Form.Control
                type="file"
                onChange={(e) => setNewImage(e.target.files[0])}
              />
            </InputGroup>
            <InputGroup className="mb-3">
              <Form.Select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option>Select Location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
            <Button variant="primary" onClick={handleAddCategory}>
              Add
            </Button>
          </div>
        )}

        {loading && <p>Loading categories...</p>}

        {Object.keys(categories).length === 0 && !loading && (
          <p>No categories found. Click on "Add" to add a new category.</p>
        )}

        {Object.keys(categories).length > 0 && (
          <Accordion>
            {Object.keys(categories).map((locationKey, idx) => (
              <Accordion.Item eventKey={idx} key={locationKey}>
                <Accordion.Header>{locationKey}</Accordion.Header>
                <Accordion.Body>
                <DragDropContext onDragEnd={(result) => onDragEnd(result, locationKey)}>
                  <Droppable droppableId={locationKey.toString()}>
                    {(provided) => (
                      <ListGroup {...provided.droppableProps} ref={provided.innerRef}>
                        {categories[locationKey].map((category, index) => (
                          <Draggable key={category.id} draggableId={category.id.toString()} index={index}>
                            {(provided) => (
                              <ListGroup.Item
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="d-flex justify-content-between align-items-center"
                              >
                                <div>
                                  <h5>{category.name}</h5>
                                  <p>{category.description}</p>
                                  {category.image_url && <img src={category.image_url} alt={category.name} style={{ width: '100px' }} />}
                                </div>
                                <Button variant="danger" onClick={() => handleDeleteCategory(category.id)}>
                                  Delete
                                </Button>
                              </ListGroup.Item>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ListGroup>
                    )}
                  </Droppable>
                </DragDropContext>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </div>

      {(alertMessage && show) && (
        <Alert className='alertMsg' variant={alertType} dismissible onClose={() => setShow(false)}>
          <p>{alertMessage}</p>
        </Alert>
      )}
    </>
  );
};

export default ManageCategories;
