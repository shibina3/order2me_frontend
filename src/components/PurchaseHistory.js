import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert, ListGroup, Badge } from 'react-bootstrap';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect( () => {
    const fetchData = async () => {
      setLoading(true);
      const purchaseRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId: localStorage.getItem('userID'), path: "/get/purchases"})
      });
      let purchaseData = await purchaseRes.json();
      purchaseData = JSON.parse(purchaseData.body);
      
      setPurchases(purchaseData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const getProgress = (status) => {    
    switch (status) {
      case 'placed':
        return 25;
      case 'confirmed':
        return 50;
      case 'delivery_scheduled':
        return 75;
      case 'delivered':
        return 100;
      default:
        return 0;
    }
  };

  const getOrderTotal = (items) => {
    return items.reduce((acc, item) => acc + parseFloat(item.price * item.quantity), 0).toFixed(2);
  };

  return (
    !isLoading ? (<Container>
      <h3 className="mb-4 text-center content-primary">My Orders</h3>
      <Row className="justify-content-center" xs={1}>
        {purchases.length > 0 ? (
          purchases.sort((a,b) => b.id - a.id).map((order, index) => (
            <Col key={index} className="mb-4">
              <Card key={order.id} className="mb-4">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Order Date: {new Date(order.created_at).toLocaleDateString()}</span>
                    <span>
                      <Badge variant="info">{order.payment_method.toUpperCase()}</Badge>
                    </span>
                    <span>
                      <Badge variant="success">₹{getOrderTotal(order.order_items)}</Badge>
                    </span>
                  </div>
                </Card.Header>

                <Card.Body>
                  <Card.Title>Order ID: {order.id}</Card.Title>
                  {
                    (order.order_status === "delivery_scheduled" && order.otp) ? <Card.Title>OTP: {order.otp}</Card.Title> : <></>
                  }
                  <ListGroup variant="flush">
                    {order.order_items.map((item) => (
                      <ListGroup.Item key={item.id}>
                        <div className="d-flex justify-content-between">
                          <span><img className='purchase_img' src={item.image_url} alt="" />{item.item_name} ({item.product_quantity})</span>
                          <span>Qty: {item.quantity}</span>
                          <span>Price: ₹{item.price * item.quantity}</span>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>

                <Card.Footer>
                {
                  order.order_status.toLowerCase() === 'declined' ? <div style={{backgroundColor: '#cb3a3a'}} className='d-flex justify-content-center align-items-center text-white'><span>Order Declined. Please contact {order.contact_admin}</span></div> : 
                  <div className="order-status-progress">
                    <div className="progress-dots d-flex justify-content-between">
                    {/* Progress bar */}
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${getProgress(order.order_status)}%` }}
                      ></div>
                    </div>

                    {/* Dots */}
                    <div className='progress-bar-cont'>
                      <div className={`dot ${getProgress(order.order_status) >= 25 ? 'completed' : ''}`}></div>
                      <span className='order-status'>Placed</span>
                    </div>
                    <div className='progress-bar-cont'>
                      <div className={`dot ${getProgress(order.order_status) >= 50 ? 'completed' : ''}`}></div>
                      <span className='order-status'>Confirmed</span>
                    </div>
                    <div className='progress-bar-cont'>
                      <div className={`dot ${getProgress(order.order_status) >= 75 ? 'completed' : ''}`}></div>
                      <span className='order-status'>Delivery Scheduled</span>
                    </div>
                    <div className='progress-bar-cont'>
                      <div className={`dot ${getProgress(order.order_status) === 100 ? 'completed' : ''}`}></div>
                      <span className='order-status'>Delivered</span>
                    </div>
                    </div>
                  </div>
                }
                </Card.Footer>
              </Card>
            </Col>
          ))
        ) : (
          <Alert variant="danger" className="text-center">
            Your order history is empty.
          </Alert>
        )}
      </Row>
    </Container>) : (<div className='loader-container'><div className="loader">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div></div>)
  );
};

export default PurchaseHistory;
