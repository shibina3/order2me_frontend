import React, { useEffect, useState } from 'react';
import { Accordion, Card, Button, Form, Alert } from 'react-bootstrap';
import { RiDeleteBinLine } from "react-icons/ri";
import AWS from 'aws-sdk';

const ManageProducts = (props) => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(null);
  const [newItemForm, setNewItemForm] = useState(null);
  const [categories, setCategories] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('danger');
  const [show, setShow] = useState(true);
  const [locations, setLocations] = useState([]);

  const s3 = new AWS.S3({
    accessKeyId: "AKIAZDZTB5RQFRIRMYHM",
    secretAccessKey: "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",
    region: 'us-east-1',
  });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const allItemsRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: "/get/items" }),
        });

        let allItems = await allItemsRes.json();
        allItems = JSON.parse(allItems.body);
        setItems(allItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      }

      const allCategoriesRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ path: "/get/categories", location: localStorage.getItem('userCity') }),
      });
      let allCategories = await allCategoriesRes.json();
      allCategories = JSON.parse(allCategories.body);
      allCategories = allCategories.sort((a, b) => a.id - b.id);
      setCategories(allCategories);

      let locRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: "/get/location" }),
      });
      let allLoc = await locRes.json();
      allLoc = JSON.parse(allLoc.body);
      setLocations(allLoc);
    };

    fetchItems();

    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const uploadImageToS3 = async (file, category, itemName) => {
    const params = {
      Bucket: 'order2me.in',
      Key: `${category}/${itemName}`,
      Body: file,
      ContentType: file.type,
    };

    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location;
  };

  const handleSave = async (isNewItem = false) => {
    if (!formData && !newItemForm) return;

    const data = isNewItem
      ? { ...newItemForm, category_id: categories.find(cat => (cat.name === newItemForm.category && cat.location === newItemForm.location)).id }
      : formData;

    const apiPath = isNewItem ? "/post/items" : "/put/items";

    try {
      let imageUrl = '';

      // Handle image upload if a new image is provided
      if (imageFile) {
        imageUrl = await uploadImageToS3(imageFile, isNewItem ? newItemForm.category : formData.category, isNewItem ? newItemForm.name : formData.name);
      }

      const response = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          image_url: imageUrl || data.image_url, // Use the new image URL or the existing one
          path: apiPath,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (isNewItem) {
          setItems([...items, { ...data, id: result.id, image_url: imageUrl }]);
          setNewItemForm(null);
          setImageFile(null);
          setAlertType('success');
          setAlertMessage('Product added successfully');
          setShow(true);
        } else {
          setItems(prevItems =>
            prevItems.map(item =>
              item.id === formData.id ? { ...item, ...formData, image_url: imageUrl || formData.image_url } : item
            )
          );
          setAlertType('success');
          setAlertMessage('Product updated successfully');
          setShow(true);
        }
        setEditingItem(null);
      } else {
        console.error('Error updating item:', result.error);
        setAlertType('danger');
        setAlertMessage('Error updating item:', result.error);
        setShow(true);
      }
    } catch (error) {
      console.error("Error saving item:", error);
      setAlertType('danger');
      setAlertMessage("Error saving item:", error);
      setShow(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          path: "/delete/items",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setItems(items.filter(item => item.id !== id));
        setAlertType('success');
        setAlertMessage('Product deleted successfully');
        setShow(true);
      } else {
        console.error('Error deleting item:', result.error);
        setAlertType('danger');
        setAlertMessage('Error deleting item:', result.error);
        setShow(true);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setAlertType('danger');
      setAlertMessage("Error deleting item:", error);
      setShow(true);
    }
  };

  const handleFormChange = (e, isNewItem = false) => {
    const { name, value, type, checked } = e.target;
    const parsedValue = type === 'checkbox' ? checked : (name.includes(['amount']) ? parseInt(value) : value);

    if (isNewItem) {
      setNewItemForm({ ...newItemForm, [name]: parsedValue });
    } else {
      setFormData({ ...formData, [name]: parsedValue });
    }
  };

  const handlePriceChange = (index, field, value, isNewItem = false) => {
    const targetForm = isNewItem ? newItemForm : formData;
    const updatedPriceDetails = [...targetForm.price_details];
    updatedPriceDetails[index][field] = value;

    if (isNewItem) {
      setNewItemForm({ ...newItemForm, price_details: updatedPriceDetails });
    } else {
      setFormData({ ...formData, price_details: updatedPriceDetails });
    }
  };

  const handleAddPriceDetail = (isNewItem) => {
    const data = isNewItem ? newItemForm : formData;
    const updatedData = {
      ...data,
      price_details: [...data.price_details, { quantity: '', amount: '' }],
    };
    isNewItem ? setNewItemForm(updatedData) : setFormData(updatedData);
  };

  const handleDeletePriceDetail = (index, isNewItem) => {
    const data = isNewItem ? newItemForm : formData;
    const updatedData = {
      ...data,
      price_details: data.price_details.filter((_, i) => i !== index),
    };
    isNewItem ? setNewItemForm(updatedData) : setFormData(updatedData);
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const renderProductForm = (isNewItem = false) => {
    const data = isNewItem ? newItemForm : formData;
    if (!data) return null;

    return (
      <Form>
        <Form.Group>
          <Form.Select
            name="location"
            value={data.location}
            onChange={(e) => handleFormChange(e, isNewItem)}
          >
            <option value="">Location</option>
            {locations.map(loc => (<option key={loc.id} value={loc.name}>{loc.name}</option>))}
          </Form.Select>
        </Form.Group>
        <Form.Group className='mt-3 mb-3'>
          <Form.Select
            name="category"
            value={data.category}
            onChange={(e) => handleFormChange(e, isNewItem)}
          >
            <option value="">Category</option>
            {categories.filter(cat => cat.location === data.location).map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={data.name}
            onChange={(e) => handleFormChange(e, isNewItem)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            name="description"
            value={data.description}
            onChange={(e) => handleFormChange(e, isNewItem)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Select
            name="stock"
            value={data.stock}
            onChange={(e) => handleFormChange(e, isNewItem)}
          >
            <option value="">Stock</option>
            <option value="in-stock">In-stock</option>
            <option value="out-of-stock">Out-of-stock</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className='d-flex1 gap-2'>
          <Form.Check
            type="checkbox"
            name="popular_item"
            checked={data.popular_item || false}
            onChange={(e) => handleFormChange(e, isNewItem)}
          />
          <Form.Label>Popular Item</Form.Label>
        </Form.Group>
        <Form.Group className='d-flex1 gap-2'>
          <Form.Check
            type="checkbox"
            name="new_arrival"
            checked={data.new_arrival || false}
            onChange={(e) => handleFormChange(e, isNewItem)}
          />
          <Form.Label>New Arrival</Form.Label>
        </Form.Group>
        <Form.Group>
          <Form.Label>Price Details</Form.Label>
          {data.price_details.map((priceDetail, index) => (
            <div className='d-flex gap-3' key={index}>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="text"
                name="quantity"
                value={priceDetail.quantity}
                label="Quantity"
                onChange={(e) => handlePriceChange(index, 'quantity', e.target.value, isNewItem)}
              />
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                label="Price"
                value={priceDetail.amount}
                onChange={(e) => handlePriceChange(index, 'amount', e.target.value, isNewItem)}
              />
              <RiDeleteBinLine style={{width: '70px', height: '25px', cursor: 'pointer'}} onClick={() => handleDeletePriceDetail(index, isNewItem)} />
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={() => handleAddPriceDetail(isNewItem)}
            className="mt-2"
          >
            Add Quantity
          </Button>
        </Form.Group>
        <Form.Group>
          <Form.Label>Upload Image</Form.Label>
          <Form.Control
            type="file"
            onChange={handleImageChange}
          />
        </Form.Group>
        <Button variant="primary" onClick={() => handleSave(isNewItem)}>
          Save
        </Button>
      </Form>
    );
  };


  const groupedItems = items.reduce((acc, item) => {
    const location = item.location;
    const category = item.category;

    if (!acc[location]) {
      acc[location] = {};
    }

    if (!acc[location][category]) {
      acc[location][category] = [];
    }

    acc[location][category].push(item);
    return acc;
  }, {});

  return (
    <><div>
      <nav aria-label="breadcrumb" className="breadcrumb-container">
        <ol className="breadcrumb d-flex">
          <li className="breadcrumb-item active" aria-current="page" onClick={() => props.setActivePage('admin')}>
            / Admin
          </li>
          <li className="breadcrumb-item active breadcrumb-secondary" aria-current="page">
            Manage Products
          </li>
        </ol>
      </nav>
      <Button onClick={() => setNewItemForm({ name: '', description: '', price_details: [{ quantity: '', amount: '' }], stock: 'in-stock', popular_item: false, new_arrival: false, category: '', location: '' })}>
        Add New Item
      </Button>
      {newItemForm && renderProductForm(true)}
      <Accordion>
        {Object.keys(groupedItems).map((location) => (
          <Accordion.Item eventKey={location} key={location}>
            <Accordion.Header>{location}</Accordion.Header>
            <Accordion.Body>
              <Accordion>
                {Object.keys(groupedItems[location]).map((category) => (
                  <Accordion.Item eventKey={category} key={category}>
                    <Accordion.Header>{category}</Accordion.Header>
                    <Accordion.Body>
                      {groupedItems[location][category].map(item => (
                        <Card key={item.id}>
                          {
                            editingItem === item.id ? (
                              renderProductForm()
                            ) : <><Card.Img variant="top" src={item.image_url} />
                              <Card.Body>
                                <Card.Title>{item.name}</Card.Title>
                                <Card.Text>{item.description}</Card.Text>
                                <Card.Text>Stock: {item.stock}</Card.Text>
                                {item.price_details.map((priceDetail, index) => (
                                  <Card.Text key={index}>
                                    Price for {priceDetail.quantity}: {priceDetail.amount}
                                  </Card.Text>
                                ))}
                                <Button onClick={() => { setEditingItem(item.id); setFormData(item); }}>Edit</Button>
                                <Button variant="danger" onClick={() => handleDelete(item.id)}>Delete</Button>
                              </Card.Body></>
                          }

                        </Card>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
      {
        (alertMessage && show) ? <Alert className='alertMsg' variant={alertType} dismissible onClose={() => setShow(false)}>
          <p>{alertMessage}</p>
        </Alert> : null
      }</>
  );
};

export default ManageProducts;
