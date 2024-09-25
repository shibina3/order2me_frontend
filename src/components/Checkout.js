// import React, { useState, useEffect } from 'react';

// const Checkout = ({setActivePage}) => {
//   const [address, setAddress] = useState(localStorage.getItem('address') || '');
//   const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('mobile') || '');
//   const [paymentMethod, setPaymentMethod] = useState('');
//   const [isEditing, setIsEditing] = useState(!address);
//   const [ items, setItems] = useState([]);

//   useEffect(() => {
//     async function fetchItems() {
//       const cartRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({userId: localStorage.getItem('userID'), path: "/get/cart"})
//       });
//       let cartData = await cartRes.json();
//       cartData = JSON.parse(cartData.body);
      
//       setItems(cartData);
//     }

//     fetchItems();
//   },[])

//   const handleAddressChange = (e) => setAddress(e.target.value);
//   const handlePhoneChange = (e) => setPhoneNumber(e.target.value);
  
//   const saveAddress = () => {
//     localStorage.setItem('address', address);
//     setIsEditing(false);
//   };

//   const savePhoneNumber = () => {
//     localStorage.setItem('mobile', phoneNumber);
//   };

//   const handlePayment = async () => {
//     const placeOrderRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ user_id: localStorage.getItem('userID'), address: address, phone_number: phoneNumber, payment_method: paymentMethod, items: items, path: "/post/orders" })
//     });
//     let placeOrder = await placeOrderRes.json();
//     placeOrder = JSON.parse(placeOrder.body);
    
//     if(placeOrder?.message) {
//       setActivePage('order_placed');
//     }
//   };

//   const isFormComplete = address && phoneNumber && (phoneNumber.length === 10) && paymentMethod;

//   return (
//     <div className="checkout-container mt-5">
//       <h2 className="text-center mb-4">Checkout</h2>

//       <div className="address-section mb-5">
//         <h4>Shipping Address</h4>
//         {isEditing ? (
//           <div>
//             <input 
//               type="text" 
//               className="form-control mb-2" 
//               value={address} 
//               onChange={handleAddressChange} 
//               placeholder="Enter your address" 
//             />
//             <button className="btn btn-danger" onClick={saveAddress}>
//               Save Address
//             </button>
//           </div>
//         ) : (
//           <div>
//             <p>{address}</p>
//             <button className="btn btn-danger" onClick={() => setIsEditing(true)}>
//               Edit Address
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="phone-section mb-5">
//         <h4>Contact Number</h4>
//         <input 
//           type="tel" 
//           className="form-control mb-2" 
//           value={phoneNumber} 
//           onChange={handlePhoneChange} 
//           onBlur={savePhoneNumber} 
//           placeholder="Enter your phone number" 
//         />
//       </div>

//       <div className="payment-method-section mb-4">
//         <h4>Payment Method</h4>
//         <div>
//           <label className="mr-3">
//             <input 
//               type="radio" 
//               name="paymentMethod" 
//               value="phonepe" 
//               onChange={() => setPaymentMethod('phonepe')} 
//             /> PhonePe
//           </label>
//           <br />
//           <label className="mr-3 mt-3">
//             <input 
//               type="radio" 
//               name="paymentMethod" 
//               value="gpay" 
//               onChange={() => setPaymentMethod('gpay')} 
//             /> Google Pay
//           </label>
//           <br />
//           <label className="mr-3 mt-3">
//             <input 
//               type="radio" 
//               name="paymentMethod" 
//               value="paytm" 
//               onChange={() => setPaymentMethod('paytm')} 
//             /> Paytm
//           </label>
//           <br />
//           <label className="mr-3 mt-3">
//             <input 
//               type="radio" 
//               name="paymentMethod" 
//               value="cod" 
//               onChange={() => setPaymentMethod('cod')} 
//             /> Cash on Delivery
//           </label>
//         </div>
//       </div>

//       <div className="review-and-pay text-center">
//         <button 
//           className="btn btn-danger" 
//           disabled={!isFormComplete} 
//           onClick={handlePayment}
//         >
//           Pay and Order
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Checkout;

import React, { useState, useEffect } from 'react';

const Checkout = ({ setActivePage, city }) => {
  const [address, setAddress] = useState(localStorage.getItem('address') || '');
  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('mobile') || '');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isEditing, setIsEditing] = useState(!address);
  const [items, setItems] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

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

      // Calculate the total amount from the items
      const total = cartData.reduce((sum, item) => sum + item.amount * item.quantity, 0);
      setTotalAmount(total);

      const fetchDeliveryfee = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: city.toLowerCase(), path: "/get/delivery_fee" }),
      });
      let delivery_fee = await fetchDeliveryfee.json();
      delivery_fee = JSON.parse(delivery_fee.body);
      setDeliveryFee(parseInt(delivery_fee.delivery_fee));
    }

    fetchItems();
  }, []);

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
        path: "/post/orders"
      }),
    });
    let placeOrder = await placeOrderRes.json();
    placeOrder = JSON.parse(placeOrder.body);

    if (placeOrder?.message) {
      setActivePage('order_placed');
    }
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

      {/* Payment Method Section */}
      <div className="payment-method-section mb-4">
        <h4>Payment Method</h4>
        <div>
          <label className="mr-3">
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
          <br />
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
