import React, { useState, useEffect } from 'react';
import { Accordion, Button, Card, ListGroup } from 'react-bootstrap';
import { apiCall } from '../../config';

const ManageOrders = (props) => {
    const [orders, setOrders] = useState(null);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState('');
    const [deliveryAssigned, setDeliveryAssigned] = useState([]);

    useEffect(() => {
        fetchOrders();
      }, []);
    
      const fetchOrders = async () => {
        const allOrdersRes = await apiCall('/get/orders');
        let allOrders = allOrdersRes.body || [];
        allOrders = allOrders.sort((a, b) => a.id - b.id);
        setOrders(allOrders);

        const allUsers = await apiCall('/get/users');
        let users = allUsers.body || [];
        let delivery_partners = users.filter(user => user.delivery_partner);
        
        setDeliveryPartners(delivery_partners);

        const allDelivers = await apiCall('/get/delivers');
        let delivers = allDelivers.body || [];          
          setDeliveryAssigned(delivers);
      };
  const groupOrdersByStatus = (orders) => {
    const grouped = {
      placed: [],
      confirmed: [],
      delivery_scheduled: [],
      delivered: [],
      declined: []
    };

    orders?.forEach(order => {
      switch (order.order_status) {
        case 'placed':
          grouped.placed.push(order);
          break;
        case 'confirmed':
          grouped.confirmed.push(order);
          break;
        case 'delivery_scheduled':
          grouped.delivery_scheduled.push(order);
          break;
        case 'delivered':
          grouped.delivered.push(order);
          break;
        case 'declined':
          grouped.declined.push(order);
          break;
        default:
          break;
      }
    });

    return grouped;
  };

  const groupedOrders = groupOrdersByStatus(orders);

  const order_status = ['placed', 'confirmed', 'delivery_scheduled', 'delivered'];

  const moveStatus = async (status, order_id) => {
    let nextStatus = status === 'declined' ? status : order_status[order_status.indexOf(status) +1];
    let payload = { status: nextStatus, order_id };
    if(status === 'confirmed') {
      if(!selectedPartner.length) { alert('Please select a delivery partner'); return; }
        let randomOTP = Math.floor(100000 + Math.random() * 900000).toString();
        payload["delivery_partner_id"] = selectedPartner;
        payload["otp"] = randomOTP;
    }
    try {
      const data = await apiCall('/change/order_status', {
        body: payload
      });
      let ordersData = data.body || [];
      ordersData = ordersData.sort((a, b) => a.id - b.id);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  }

  const handleDeliveryPartnerChange = (e) => {
    const selectedPartnerId = e.target.value;
    setSelectedPartner(selectedPartnerId);
  };  

  return (
    <div className="manage-orders">
        <nav aria-label="breadcrumb" className="breadcrumb-container">
        <ol className="breadcrumb d-flex">
          <li className="breadcrumb-item active" aria-current="page" onClick={() => {props.setActivePage('admin')}}>
            / Admin
          </li>
          <li className="breadcrumb-item active breadcrumb-secondary" aria-current="page">
            Manage Orders
          </li>
        </ol>
      </nav>
      <Accordion defaultActiveKey="0">
        {/* Placed Orders */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>Placed Orders ({groupedOrders.placed.length})</Accordion.Header>
          <Accordion.Body>
            {groupedOrders.placed.length > 0 ? (
              groupedOrders.placed.sort((a,b) => b.id - a.id).map(order => (
                <Card key={order.id} className="mb-3">
                  <Card.Body>
                    <Card.Title>Order ID: {order.id}</Card.Title>
                    <Card.Text>Customer Name: {order.username}</Card.Text>
                    <Card.Text>Address: {order.address}</Card.Text>
                    <Card.Text>Phone: {order.phone_number}</Card.Text>
                    <Card.Text>Payment Method: {order.payment_method}</Card.Text>
                    <Card.Text>Payment Status: {order.payment_status}</Card.Text>
                    <Card.Text>Order Status: {order.order_status}</Card.Text>
                    <Card.Text>Order Date: {new Date(order.created_at).toLocaleString()}</Card.Text>
                    <Card.Text>Chosen Time Slot: {order.selected_timeslot || 'NA'}</Card.Text>
                    {
                      order.instructions && <Card.Text><b>Instructions:</b> {order.instructions}</Card.Text>
                    }
                    <ListGroup variant="flush">
                    {order?.order_items.map((item) => (
                      <ListGroup.Item key={item.id}>
                        <div className="d-flex justify-content-between">
                          <span><img className='purchase_img' src={item.image_url} alt="" />{item.item_name} ({item.product_quantity})</span>
                          <span>Qty: {item.quantity}</span>
                          <span>Price: ₹{item.price}</span>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                    <Card.Text>
                        <Button variant='success' onClick={()=>{moveStatus('placed', order.id)}}>Confirm</Button>
                        <Button variant='danger' onClick={()=>{moveStatus('declined', order.id)}}>Decline</Button>
                    </Card.Text>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No placed orders.</p>
            )}
          </Accordion.Body>
        </Accordion.Item>

        {/* Confirmed Orders */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>Confirmed Orders ({groupedOrders.confirmed.length})</Accordion.Header>
          <Accordion.Body>
            {groupedOrders.confirmed.length > 0 ? (
              groupedOrders.confirmed.sort((a,b) => b.id - a.id).map(order => (
                <Card key={order.id} className="mb-3">
                  <Card.Body>
                    <Card.Title>Order ID: {order.id}</Card.Title>
                    <Card.Text>Customer Name: {order.username}</Card.Text>
                    <Card.Text>Address: {order.address}</Card.Text>
                    <Card.Text>Phone: {order.phone_number}</Card.Text>
                    <Card.Text>Payment Method: {order.payment_method}</Card.Text>
                    <Card.Text>Payment Status: {order.payment_status}</Card.Text>
                    <Card.Text>Order Status: {order.order_status}</Card.Text>
                    <Card.Text>Order Date: {new Date(order.created_at).toLocaleString()}</Card.Text>
                    <Card.Text>Chosen Time Slot: {order.selected_timeslot || 'NA'}</Card.Text>
                    {
                      order.instructions && <Card.Text><b>Instructions:</b> {order.instructions}</Card.Text>
                    }
                    <ListGroup variant="flush">
                      {order?.order_items.map((item) => (
                        <ListGroup.Item key={item.id}>
                          <div className="d-flex justify-content-between">
                            <span><img className='purchase_img' src={item.image_url} alt="" />{item.item_name} ({item.product_quantity})</span>
                            <span>Qty: {item.quantity}</span>
                            <span>Price: ₹{item.price}</span>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                    <Card.Text>
                    <select 
                        id={`delivery-partner-${order.id}`} 
                        className="form-select" 
                        onChange={(e) => handleDeliveryPartnerChange(e)}
                    >
                        <option value="">Select Delivery Partner *</option>
                        {deliveryPartners.map(partner => (
                        <option key={partner.id} value={partner.id}>{partner.username}</option>
                        ))}
                    </select>
                    </Card.Text>
                    <Card.Text>
                        <Button variant='success' onClick={()=>{moveStatus('confirmed', order.id)}}>Confirm</Button>
                        <Button variant='danger' onClick={()=>{moveStatus('declined', order.id)}}>Decline</Button>
                    </Card.Text>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No confirmed orders.</p>
            )}
          </Accordion.Body>
        </Accordion.Item>

        {/* Delivery Scheduled Orders */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>Delivery Scheduled Orders ({groupedOrders.delivery_scheduled.length})</Accordion.Header>
          <Accordion.Body>
            {groupedOrders.delivery_scheduled.length > 0 ? (
              groupedOrders.delivery_scheduled.sort((a,b) => b.id - a.id).map(order => (
                <Card key={order.id} className="mb-3">
                  <Card.Body>
                    <Card.Title>Order ID: {order.id}</Card.Title>
                    <Card.Text>Customer Name: {order.username}</Card.Text>
                    <Card.Text>Address: {order.address}</Card.Text>
                    <Card.Text>Phone: {order.phone_number}</Card.Text>
                    <Card.Text>Payment Method: {order.payment_method}</Card.Text>
                    <Card.Text>Payment Status: {order.payment_status}</Card.Text>
                    <Card.Text>Order Status: {order.order_status}</Card.Text>
                    <Card.Text>Order Date: {new Date(order.created_at).toLocaleString()}</Card.Text>
                    <Card.Text>Chosen Time Slot: {order.selected_timeslot || 'NA'}</Card.Text>
                    {
                      order.instructions && <Card.Text><b>Instructions:</b> {order.instructions}</Card.Text>
                    }
                    <Card.Text>Assigned Partner: {deliveryPartners?.find(part => {
                        return part.id === deliveryAssigned?.find(del => del.order_id === order.id)?.delivery_partner_id
                    })?.username}</Card.Text>
                    <ListGroup variant="flush">
                      {order?.order_items.map((item) => (
                        <ListGroup.Item key={item.id}>
                          <div className="d-flex justify-content-between">
                            <span><img className='purchase_img' src={item.image_url} alt="" />{item.item_name} ({item.product_quantity})</span>
                            <span>Qty: {item.quantity}</span>
                            <span>Price: ₹{item.price}</span>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                    <Card.Text>
                    <Button variant='success' onClick={()=>{moveStatus('delivery_scheduled', order.id)}}>Confirm</Button>
                    <Button variant='danger' onClick={()=>{moveStatus('declined', order.id)}}>Decline</Button>
                    </Card.Text>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No delivery scheduled orders.</p>
            )}
          </Accordion.Body>
        </Accordion.Item>

        {/* Delivered Orders */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>Delivered Orders ({groupedOrders.delivered.length})</Accordion.Header>
          <Accordion.Body>
            {groupedOrders.delivered.length > 0 ? (
              groupedOrders.delivered.sort((a,b) => b.id - a.id).map(order => (
                <Card key={order.id} className="mb-3">
                  <Card.Body>
                    <Card.Title>Order ID: {order.id}</Card.Title>
                    <Card.Text>Customer Name: {order.username}</Card.Text>
                    <Card.Text>Address: {order.address}</Card.Text>
                    <Card.Text>Phone: {order.phone_number}</Card.Text>
                    <Card.Text>Payment Method: {order.payment_method}</Card.Text>
                    <Card.Text>Payment Status: {order.payment_status}</Card.Text>
                    <Card.Text>Order Status: {order.order_status}</Card.Text>
                    <Card.Text>Order Date: {new Date(order.created_at).toLocaleString()}</Card.Text>
                    <Card.Text>Chosen Time Slot: {order.selected_timeslot || 'NA'}</Card.Text>
                    {
                      order.instructions && <Card.Text><b>Instructions:</b> {order.instructions}</Card.Text>
                    }
                    <ListGroup variant="flush">
                      {order?.order_items.map((item) => (
                        <ListGroup.Item key={item.id}>
                          <div className="d-flex justify-content-between">
                            <span><img className='purchase_img' src={item.image_url} alt="" />{item.item_name} ({item.product_quantity})</span>
                            <span>Qty: {item.quantity}</span>
                            <span>Price: ₹{item.price}</span>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No delivered orders.</p>
            )}
          </Accordion.Body>
        </Accordion.Item>

        {/* Declined Orders */}
        <Accordion.Item eventKey="4">
          <Accordion.Header>Declined Orders ({groupedOrders.declined.length})</Accordion.Header>
          <Accordion.Body>
            {groupedOrders.declined.length > 0 ? (
              groupedOrders.declined.sort((a,b) => b.id - a.id).map(order => (
                <Card key={order.id} className="mb-3">
                  <Card.Body>
                    <Card.Title>Order ID: {order.id}</Card.Title>
                    <Card.Text>Customer Name: {order.username}</Card.Text>
                    <Card.Text>Address: {order.address}</Card.Text>
                    <Card.Text>Phone: {order.phone_number}</Card.Text>
                    <Card.Text>Payment Method: {order.payment_method}</Card.Text>
                    <Card.Text>Payment Status: {order.payment_status}</Card.Text>
                    <Card.Text>Order Status: {order.order_status}</Card.Text>
                    <Card.Text>Order Date: {new Date(order.created_at).toLocaleString()}</Card.Text>
                    <Card.Text>Chosen Time Slot: {order.selected_timeslot || 'NA'}</Card.Text>
                    {
                      order.instructions && <Card.Text><b>Instructions:</b> {order.instructions}</Card.Text>
                    }
                    <ListGroup variant="flush">
                      {order?.order_items.map((item) => (
                        <ListGroup.Item key={item.id}>
                          <div className="d-flex justify-content-between">
                            <span><img className='purchase_img' src={item.image_url} alt="" />{item.item_name} ({item.product_quantity})</span>
                            <span>Qty: {item.quantity}</span>
                            <span>Price: ₹{item.price}</span>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No declined orders.</p>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ManageOrders;
