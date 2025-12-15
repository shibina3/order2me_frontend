import React, { useState, useEffect } from 'react';
import { Accordion, Button, Card, Form, ListGroup } from 'react-bootstrap';
import { apiCall } from '../../config';

const DeliveryPartnerDashboard = (props) => {
    const [orders, setOrders] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    const [otp, setOtp] = useState(''); 
    const [otpError, setOtpError] = useState(''); 
    const myID = localStorage.getItem('userID');
    
// eslint-disable-next-line
      useEffect(() => {
        const fetchOrders = async () => {
          try {
            const allOrdersRes = await apiCall('/get/orders');
            let allOrders = allOrdersRes.body || [];
          allOrders = allOrders.sort((a, b) => a.id - b.id);
          setOrders(allOrders);
  
            const allDelivers = await apiCall('/get/delivers');
            let delivers = allDelivers.body || [];
            // eslint-disable-next-line
            delivers = delivers.filter(del => del.delivery_partner_id == myID);
            
            setDeliveries(delivers);
          } catch (error) {
            console.error("Error fetching orders:", error);
          }
        };
        fetchOrders();
        // eslint-disable-next-line
      }, []);

      const groupOrdersByStatus = (orders) => {
        const grouped = {
          delivery_scheduled: [],
          delivered: []
        };

        orders?.forEach(order => {
          // eslint-disable-next-line
          let myDeliveries = deliveries.filter(del => (del.order_id === order.id && del.delivery_partner_id == myID));
          switch (order.order_status) {
            case 'delivery_scheduled':
                if(myDeliveries.length) {
                    grouped.delivery_scheduled.push(order);
                }
                break;
            case 'delivered':
                if(myDeliveries.length) {
                    grouped.delivered.push(order);
                }
              break;
            default:
              break;
          }
        });

        return grouped;
      };

  const groupedOrders = groupOrdersByStatus(orders);

  const order_status = ['delivery_scheduled', 'delivered'];

  const handleOtpChange = (e) => {
        setOtp(e.target.value);
    };

    const verifyOtp = async (otp, order_id) => {
        if (otp.length !== 6) {
            setOtpError("OTP must be 6 digits");
            return false;
        }
        try {
          const data = await apiCall('/verify/otp', {
            body: { otp, order_id }
        });
        const verified = data?.success;

        if (!verified) {
            setOtpError("Invalid OTP");
            return false;
        }

        setOtpError(""); 
        setOtp("");
        return true;
        } catch (error) {
          console.error("Error verifying OTP:", error);
          setOtpError("Error verifying OTP");
          return false;
        }
    };

  const moveStatus = async (status, order_id) => {
    if(status === "delivery_scheduled") {
        const otpValid = await verifyOtp(otp, order_id);
        if (!otpValid) return;
    }
    let nextStatus = status === 'declined' ? status : order_status[order_status.indexOf(status) +1];
    try {
      const data = await apiCall('/change/order_status', {
        body: { status: nextStatus, order_id }
      });
      let ordersData = data.body || [];
      ordersData = ordersData.sort((a, b) => a.id - b.id);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  }

  return (
    <div className="manage-orders">
        <nav aria-label="breadcrumb" className="breadcrumb-container">
        <ol className="breadcrumb d-flex">
          <li className="breadcrumb-item active breadcrumb-secondary" aria-current="page">
            / Delivery Partner Dashboard
          </li>
        </ol>
      </nav>
      <Accordion defaultActiveKey="0">
        {/* Delivery Assigned Orders */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>Assigned Orders ({groupedOrders.delivery_scheduled.length})</Accordion.Header>
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
                    <Card.Text>Assigned Partner: {localStorage.getItem('name')}</Card.Text>
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
                        <Form.Group controlId="otpInput">
                            <Form.Label>Enter OTP</Form.Label>
                            <Form.Control 
                                type="number" 
                                value={otp} 
                                onChange={handleOtpChange} 
                                placeholder="Enter 6-digit OTP" 
                            />
                            {otpError && <p style={{ color: 'red' }}>{otpError}</p>}
                        </Form.Group>
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
      </Accordion>
    </div>
  );
};

export default DeliveryPartnerDashboard;
