import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { apiCall } from '../config';

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
  const [wallet, setWallet] = useState(0);
  const [totalforWallet, setTotalforWallet] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [applyBtnText, setApplyBtnText] = useState('Apply');
  const [discount, setDiscount] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);

  // UPI / QR details
  const UPI_ID = '6379103258@pthdfc';
  const UPI_PAYEE = 'Order2me Fresh Mart';
  // Build UPI deep link, then encode once for the QR generator
  const upiString = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_PAYEE)}&cu=INR`;
  const qrUrl = `https://chart.googleapis.com/chart?chs=320x320&cht=qr&chl=${encodeURIComponent(upiString)}`;

  useEffect(() => {
    async function fetchItems() {
      try {
        const cartRes = await apiCall('/get/cart', {
          body: {
            userId: localStorage.getItem('userID'),
            location: localStorage.getItem('userCity')
          }
      });
        setWallet(cartRes.wallet);
        let cartData = cartRes.body || [];
      setItems(cartData);

      const total = cartData.reduce((sum, item) => sum + item.amount * item.quantity, 0);
      setTotalforWallet(total);
      setTotalAmount(total);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }

      try {
        const fetchDeliveryfee = await apiCall('/get/delivery_fee', {
          body: { city: city }
      });
        let delivery_fee = fetchDeliveryfee.body || [];
      setAllDeliveryFee(delivery_fee);
      setDeliveryFee(parseInt(delivery_fee[0].delivery_fee));
      } catch (error) {
        console.error("Error fetching delivery fee:", error);
      }

      try {
        const fetchTimeSlots = await apiCall('/get/time_slots');
        let timeSlots = fetchTimeSlots.body || [];
      setTimeSlots(timeSlots);
      setSelectedTimeSlot(timeSlots[0].from_time + ' - ' + timeSlots[0].to_time);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
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
    if (!landmark) {
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
    if (!selectedTimeSlot || !deliveryFee) {
      alert('Please select a time slot and area');
      return;
    }
    try {
      const placeOrder = await apiCall('/post/orders', {
        body: {
        user_id: localStorage.getItem('userID'),
        address: address,
        phone_number: phoneNumber,
        payment_method: paymentMethod,
        items: items,
        selectedTimeSlot: selectedTimeSlot,
        instructions: instructions,
          useWallet: useWallet
        }
    });

    if (placeOrder?.message) {
      setCartNumber(0);
      setActivePage('order_placed');
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert('Error placing order. Please try again.');
    }
  };

  const handleDelChange = (event) => {
    const selectedArea = event.target.value;
    setDeliveryFee(parseInt(allDeliveryFee?.find(area => area.area_name === selectedArea).delivery_fee));
  };

  const applyPromoCode = async () => {
    setApplyBtnText('Applying...');
    try {
      const promoCodeRes = await apiCall('/get/promo-code', {
        body: { code: promoCode }
    });
      let promoCodeData = promoCodeRes.body || [];

    if (promoCodeData.length) {
      promoCodeData = promoCodeData[0];
      let discount = promoCodeData.discount;
      let discountType = promoCodeData.discount_type;
      if (discountType === 'percentage') {
        discount = totalAmount * discount / 100;
      }
      setDiscount(discount);
      setTotalAmount(totalAmount - discount);
      setApplyBtnText('Applied');
    } else {
      alert('Invalid promo code');
      setApplyBtnText('Apply');
    }
    } catch (error) {
      console.error("Error applying promo code:", error);
      alert('Error applying promo code');
      setApplyBtnText('Apply');
    }
  }

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

      {/* Use wallet money section */}
      {
        totalforWallet < 500 ? (
          <p className="my-3 text-danger phone-section mb-5">* Purchase above ₹500 to use your wallet</p>
        ) :
          wallet > 0 ? (
            <div className="phone-section mb-5">
              <input type="checkbox" id="use-wallet" onChange={(e) => {
                if (e.target.checked) {
                  setUseWallet(true);
                  totalAmount > wallet ? setTotalAmount(totalAmount - wallet) : setTotalAmount(0);
                } else {
                  setUseWallet(false);
                  setTotalAmount(totalforWallet);
                }
              }} />
              <label htmlFor="use-wallet" className="ms-2">Use Wallet Money ?</label>
              <p>You have ₹ {wallet} in your wallet</p>
            </div>
          ) : (
            <p className="text-danger phone-section mb-5">You have ₹ 0 in your wallet</p>
          )
      }

      {/* Apply Promo code */}
      <div className="phone-section mb-5">
        <h4>Apply Promo Code</h4>
        <div className='d-flex gap-2 align-items-center mb-2 justify-content-start'>
          <input
            type="text"
            className="form-control mb-0 w-75"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
          />
          <button disabled={applyBtnText === 'Applied'} className='btn btn-warning' onClick={applyPromoCode}>{applyBtnText}</button>
        </div>
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
        {
          promoCode ? (
            <div className="d-flex justify-content-between">
              <span>Discount</span>
              <span>- ₹{discount}</span>
            </div>
          ) : null
        }
        <div className="d-flex justify-content-between">
          <strong>To Pay</strong>
          <strong>₹{totalAmount + deliveryFee}</strong>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="payment-method-section mb-4">
        <h4>Payment Method</h4>
        <div>
          <label className="mr-3 mt-3 d-flex gap-2 align-items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="upi_qr"
              onChange={() => { setPaymentMethod('upi_qr'); setShowQrModal(true); }}
            /> Pay using UPI QR
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

      {/* QR Modal */}
      {showQrModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <div className="modal-header">
                <h5 className="modal-title">Scan & Pay via UPI</h5>
                <button type="button" className="btn-close" onClick={() => setShowQrModal(false)} />
              </div>
              <div className="modal-body text-center">
                <img src={qrUrl} alt="UPI QR" style={{ maxWidth: '320px', width: '100%' }} />
                <p className="mt-3 mb-1"><strong>Payee:</strong> {UPI_PAYEE}</p>
                <p className="mb-2"><strong>UPI ID:</strong> {UPI_ID}</p>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigator.clipboard?.writeText(UPI_ID)}
                >
                  Copy UPI ID
                </button>
                <p className="text-muted mt-3" style={{ fontSize: '12px' }}>
                  After payment, tap “Pay and Order” to place your order. If you close this, you can reopen by selecting “Pay using UPI QR”.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowQrModal(false)}>Close</button>
                <button className="btn btn-success" onClick={() => { setPaymentMethod('upi_qr'); setShowQrModal(false); }}>I have scanned</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
