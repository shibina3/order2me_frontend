import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { IoMdAdd } from "react-icons/io";
import { AiOutlineMinus } from "react-icons/ai";

const Cart = (props) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const cartItemsRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userId: localStorage.getItem('userID'), path: "/get/cart"})
        });

        if (!cartItemsRes.ok) throw new Error("Failed to fetch cart items");

        let storedCart = await cartItemsRes.json();        
        storedCart = JSON.parse(storedCart.body);
        setCartItems(storedCart);

        const calculatedTotal = storedCart.reduce((acc, item) => acc + item.amount * item.quantity, 0);
        setTotal(calculatedTotal);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cart data:", error);
        setLoading(false);
      }

    }
    fetchData();
  }, []);

  const updateQuantity = async (index, quantity) => {
    if (quantity < 1) return;

    const item = cartItems[index];

    try {
      await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity, amount: item.amount, user_id: localStorage.getItem('userID'), path: "/put/items", id: item.item_id })
      });

      const updatedCartItems = [...cartItems];
      updatedCartItems[index].quantity = quantity;
      setCartItems(updatedCartItems);

      const newTotal = updatedCartItems.reduce((acc, item) => acc + item.amount * item.quantity, 0);
      setTotal(newTotal);
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
    }
  };

  const removeItem = async (index) => {
    const item = cartItems[index];

    try {
      await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: localStorage.getItem('userID'), path: "/delete/items", id: item.item_id })
      });

      const updatedCartItems = cartItems.filter((_, i) => i !== index);
      setCartItems(updatedCartItems);

      const newTotal = updatedCartItems.reduce((acc, item) => acc + item.amount * item.quantity, 0);
      setTotal(newTotal);
    } catch (error) {
      console.error("Error removing cart item:", error);
    }
  };

  const handleCheckout = () => {
    if (total > 200) {
      props.setActivePage('checkout');
    } else {
      setShowAlert(true);
    }
  };

  return (
    !isLoading ? (<Container>
      <h3 className="mb-4 text-center content-primary">Your Cart</h3>
      {showAlert && (
        <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
          The total must be greater than ₹200 to proceed to checkout.
        </Alert>
      )}
      {cartItems.length > 0 ? (
        <>
          <Row>
            {cartItems.map((item, index) => (
              <Col xs={12} key={index} className="mb-4">
                <Card className="cart-card shadow-sm">
                  <Row>
                    <Col xs={5} md={5}>
                      <Card.Img variant="left" src={item.image_url} alt={item.name} className="cart-card-image" />
                    </Col>
                    <Col xs={7} md={7}>
                      <Card.Body className='border-0'>
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Text>
                          <strong>Price:</strong> ₹{item.amount}
                        </Card.Text>
                        <Card.Text>
                          <strong>Total:</strong> ₹{(item.amount * item.quantity).toFixed(2)}
                        </Card.Text>
                        <div className="d-flex align-items-start">
                          <Form.Control
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(index, Number(e.target.value))}
                            className="text-center"
                            style={{ width: '50px' }}
                          />
                          <span
                            className="addremove m-2"
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                          >
                            <AiOutlineMinus />
                          </span>
                          <span
                            className="addremove m-2"
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                          >
                            <IoMdAdd />
                          </span>
                          <span
                            className="m-2 remove-btn"
                            onClick={() => removeItem(index)}
                          >
                            <FaTrash />
                          </span>
                        </div>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
          <Row>
            <Col className="text-right">
              <h4>
                <strong>Total: </strong>₹{total.toFixed(2)}
              </h4>
              <Button variant="success" className="mt-3 w-100" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </Col>
          </Row>
        </>
      ) : (
        <Alert variant="danger" className="text-center">
          Your cart is empty.
        </Alert>
      )}
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

export default Cart;
