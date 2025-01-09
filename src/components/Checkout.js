import React, { useState, useEffect } from 'react';

const Checkout = ({ setActivePage, city, setCartNumber }) => {
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
  const [buildingNo, setBuildingNo] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');

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

  const handleBuildingNoChange = (e) => {
    const value = e.target.value;
    setBuildingNo(value);
    setAddress(`${value}, ${addrLine1}, ${addrLine2}`);
  }

  const handleAddrLine1Change = (e) => {
    const value = e.target.value;
    setAddrLine1(value);
    setAddress(`${buildingNo}, ${value}, ${addrLine2}`);
  }

  const handleAddrLine2Change = (e) => {
    const value = e.target.value;
    setAddrLine2(value);
    setAddress(`${buildingNo}, ${addrLine1}, ${value}`);
  }

  const handleLandmarkChange = (e) => {
    const value = e.target.value;
    setLandmark(value);
    setAddress(`${buildingNo}, ${addrLine1}, ${addrLine2}, Landmark - ${value}`);
  }

  const handlePhoneChange = (e) => setPhoneNumber(e.target.value);

  const saveAddress = () => {
    if(!landmark) { 
      alert('Please enter a landmark');
      return;
    }
    localStorage.setItem('address', address);
    setIsEditing(false);
  };

  const savePhoneNumber = () => {
    localStorage.setItem('mobile', phoneNumber);
  };

  const handlePayment = async () => {
    console.log("items", items);
    
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
        instructions: instructions,
        path: "/post/orders"
      }),
    });
    let placeOrder = await placeOrderRes.json();
    placeOrder = JSON.parse(placeOrder.body);

    if (placeOrder?.message) {
      setCartNumber(0);
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
              <span>{item.name} ({item.price_quantity} x{item.quantity})</span>
              <span>₹{parseInt(item.amount) * parseInt(item.quantity)}</span>
            </div>
          ))
        ) : (
          <p>No items in the cart.</p>
        )}
      </div>

      {/* get Instructions from Customer */}
      <div className="instructions-section mb-5">
        <h4>Give instructions</h4>
        <textarea
          className="form-control"
          placeholder="Any special instructions?"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        ></textarea>
      </div>

      {/* Address Section */}
      <div className="address-section mb-5">
        <h4>Shipping Address</h4>
        {isEditing ? (
          <div>
              <input 
                type="text" 
                className="form-control mb-2" 
                value={buildingNo} 
                onChange={handleBuildingNoChange} 
                placeholder="Building No/Flat No" 
              />
              <input 
                type="text" 
                className="form-control mb-2" 
                value={addrLine1} 
                onChange={handleAddrLine1Change} 
                placeholder="Address line 1" 
              />
              <input 
                type="text" 
                className="form-control mb-2" 
                value={addrLine2} 
                onChange={handleAddrLine2Change} 
                placeholder="Address line 2" 
              />
              <input 
                type="text" 
                className="form-control mb-2" 
                value={landmark} 
                onChange={handleLandmarkChange} 
                placeholder="Landmark *" 
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
        <label className='text-danger'>Book your slot:</label>
        <select className='ms-2' onChange={(e) => setSelectedTimeSlot(e.target.value)}>
          {
            timeSlots.length ? (() => {
              let date = new Date();
              let hours = date.getHours();
              let minutes = date.getMinutes();
              let currentTime = hours * 60 + minutes;
          
              // Calculate 1 hour ahead of the current time
              let oneHourAhead = currentTime + 60;
          
              // Today's slots: Filter out finished slots and slots within the next hour
              let todaySlots = timeSlots.filter(slot => {
                  let fromTime = slot.from_time.split(':');
                  let from = parseInt(fromTime[0]) * 60 + parseInt(fromTime[1]);
                  return from > oneHourAhead; // Only show slots at least 1 hour ahead
              });
          
              // Tomorrow's slots: All slots remain
              let tomorrowSlots = timeSlots;
          
              // Add a flag for day labels
              const combinedSlots = [
                  ...todaySlots.map(slot => ({ ...slot, dayPrefix: "Today" })),
                  ...tomorrowSlots.map(slot => ({ ...slot, dayPrefix: "Tomorrow" }))
              ];
          
              return combinedSlots
                  .sort((a, b) => a.dayPrefix.localeCompare(b.dayPrefix) || a.from_time.localeCompare(b.from_time))
                  .map((slot, index) => {
                      let fromTime = slot.from_time.split(':');
                      let toTime = slot.to_time.split(':');
          
                      let from = fromTime[0] < 12 
                          ? `${fromTime[0]}:${fromTime[1]} AM` 
                          : fromTime[0] == 12 
                          ? `${fromTime[0]}:${fromTime[1]} PM` 
                          : `${fromTime[0] - 12}:${fromTime[1]} PM`;
          
                      let to = toTime[0] < 12 
                          ? `${toTime[0]}:${toTime[1]} AM` 
                          : toTime[0] == 12 
                          ? `${toTime[0]}:${toTime[1]} PM` 
                          : `${toTime[0] - 12}:${toTime[1]} PM`;
          
                      return (
                          <option className='fs-12' key={index} value={`${slot.dayPrefix} ${from} - ${to}`}>
                              {`${slot.dayPrefix}: ${from} - ${to}`}
                          </option>
                      );
                  });
          })()                
           : null
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
