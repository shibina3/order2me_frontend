import React, { useState, useEffect } from 'react';

const Checkout = ({ setActivePage, city }) => {
  const [address, setAddress] = useState(localStorage.getItem('address') || '');
  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('mobile') || '');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isEditing, setIsEditing] = useState(!address);
  const [items, setItems] = useState([]);
  const [allDeliveryFee, setAllDeliveryFee] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  useEffect(() => {
    async function fetchItems() {
      const cartRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: localStorage.getItem('userID'), path: "/get/cart" }),
      });
      let cartData = await cartRes.json();
      cartData = JSON.parse(cartData.body);
      setItems(cartData);

      const total = cartData.reduce((sum, item) => sum + item.amount * item.quantity, 0);
      setTotalAmount(total);

      const fetchDeliveryfee = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: city, path: "/get/delivery_fee" }),
      });
      let delivery_fee = await fetchDeliveryfee.json();
      delivery_fee = JSON.parse(delivery_fee.body);
      setAllDeliveryFee(delivery_fee);

      const fetchTimeSlots = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: "/get/time_slots" }),
      });
      let timeSlots = await fetchTimeSlots.json();
      timeSlots = JSON.parse(timeSlots.body);
      setTimeSlots(timeSlots);
    }

    fetchItems();
  }, [city]);

  const handleAddressChange = (e) => setAddress(e.target.value);
  const handlePhoneChange = (e) => setPhoneNumber(e.target.value);

  const saveAddress = () => {
    localStorage.setItem('address', address);
    setIsEditing(false);
  };

  const savePhoneNumber = () => {
    localStorage.setItem('mobile', phoneNumber);
  };

  const handlePayment = async () => {
    if( !selectedTimeSlot || !deliveryFee ) { 
      alert('Please select a time slot and area');
      return; }
    const placeOrderRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: localStorage.getItem('userID'),
        address: address,
        phone_number: phoneNumber,
        payment_method: paymentMethod,
        items: items,
        selectedTimeSlot: selectedTimeSlot,
        path: "/post/orders"
      }),
    });
    let placeOrder = await placeOrderRes.json();
    placeOrder = JSON.parse(placeOrder.body);

    if (placeOrder?.message) {
      setActivePage('order_placed');
    }
  };

  const handleDelChange = (event) => {
    const selectedArea = event.target.value;
    setDeliveryFee(parseInt(allDeliveryFee?.find(area => area.area_name === selectedArea).delivery_fee));
  };

  const isFormComplete = address && phoneNumber && phoneNumber.length === 10 && paymentMethod;
  
  return (
    <div className="checkout-container">
      <h2 className="text-center mb-4">Order Summary</h2>

      {/* Items Summary */}
      <div className="order-items-section mb-5">
        <h4>Items</h4>
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="d-flex justify-content-between">
              <span>{item.name} (x{item.quantity})</span>
              <span>₹{parseInt(item.amount) * parseInt(item.quantity)}</span>
            </div>
          ))
        ) : (
          <p>No items in the cart.</p>
        )}
      </div>

      {/* Address Section */}
      <div className="address-section mb-5">
        <h4>Shipping Address</h4>
        {isEditing ? (
          <div>
            <input 
              type="text" 
              className="form-control mb-2" 
              value={address} 
              onChange={handleAddressChange} 
              placeholder="Enter your address" 
            />
            <button className="checkout-details" onClick={saveAddress}>
              Save Address
            </button>
          </div>
        ) : (
          <div>
            <p>{address}</p>
            <button className="checkout-details" onClick={() => setIsEditing(true)}>
              Edit Address
            </button>
          </div>
        )}
      </div>

      {/* Choose Area */}
      <div className="area-section mb-5">
        <h4>Choose Area</h4>
        <label className='text-danger'>Select your area:</label>
        <select className='ms-2' onChange={handleDelChange}>
          <option value={''}></option>
          {
            allDeliveryFee.length ? allDeliveryFee?.map((area, index) => (
              <option key={index} value={area.area_name}>{area.area_name}</option>
            )) : null
          }
        </select>
      </div>

      {/* Choose Time Slot */}
      <div className="area-section mb-5">
        <h4>Choose Time Slot</h4>
        <label className='text-danger'>Book your time slot:</label>
        <select className='ms-2' onChange={(e) => setSelectedTimeSlot(e.target.value)}>
          <option value={''}></option>
          {
            timeSlots.length ? timeSlots?.filter(slot => {
              let date = new Date();
              let hours = date.getHours();
              let minutes = date.getMinutes();
              let currentTime = hours * 60 + minutes;
              let fromTime = slot.from_time.split(':');
              let from = parseInt(fromTime[0]) * 60 + parseInt(fromTime[1]);
              return currentTime < from;
            }).sort((a, b) => a.from_time.localeCompare(b.from_time)).map((slot, index) => {
              let fromTime = slot.from_time.split(':');
              let toTime = slot.to_time.split(':');
              let from = fromTime[0] < 12 ? `${fromTime[0]}:${fromTime[1]} AM` : fromTime[0] = 12 ? `${fromTime[0]}:${fromTime[1]} PM` : `${fromTime[0] - 12}:${fromTime[1]} PM`;
              let to = toTime[0] < 12 ? `${toTime[0]}:${toTime[1]} AM` : toTime[0] = 12 ? `${toTime[0]}:${toTime[1]} PM` : `${toTime[0] - 12}:${toTime[1]} PM`;
              return <option key={index} value={`${from} - ${to}`}>{`${from} - ${to}`}</option>
            }) : null
          }
        </select>
      </div>

      {/* Contact Number Section */}
      <div className="phone-section mb-5">
        <h4>Contact Number</h4>
        <input 
          type="tel" 
          className="form-control mb-2" 
          value={phoneNumber} 
          onChange={handlePhoneChange} 
          onBlur={savePhoneNumber} 
          placeholder="Enter your phone number" 
        />
      </div>

      {/* Billing Section */}
      <div className="billing-section mb-5">
        <h4>Bill Details</h4>
        <div className="d-flex justify-content-between">
          <span>Item Total</span>
          <span>₹{totalAmount}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>Delivery Fee</span>
          <span>₹{deliveryFee}</span>
        </div>
        <div className="d-flex justify-content-between">
          <strong>To Pay</strong>
          <strong>₹{totalAmount + deliveryFee}</strong>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="payment-method-section mb-4">
        <h4>Payment Method</h4>
        <div>
          {/* <label className="mr-3">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="phonepe" 
              onChange={() => setPaymentMethod('phonepe')} 
            /> PhonePe
          </label>
          <br />
          <label className="mr-3 mt-3">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="gpay" 
              onChange={() => setPaymentMethod('gpay')} 
            /> Google Pay
          </label>
          <br />
          <label className="mr-3 mt-3">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="paytm" 
              onChange={() => setPaymentMethod('paytm')} 
            /> Paytm
          </label>
          <br /> */}
          <label className="mr-3 mt-3">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="cod" 
              onChange={() => setPaymentMethod('cod')} 
            /> Cash on Delivery
          </label>
        </div>
      </div>

      {/* Pay and Order Button */}
      <div className="review-and-pay text-center">
        <button 
          className="btn btn-danger" 
          disabled={!isFormComplete} 
          onClick={handlePayment}
        >
          Pay and Order
        </button>
      </div>
    </div>
  );
};

export default Checkout;
