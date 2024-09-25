import React from 'react';

const OrderPlaced = ({setActivePage}) => {

  const handleGoHome = () => {
    setActivePage('home');
  };

  return (
    <div className="order-placed-container text-center mt-5">
      <div className="success-icon mb-4">
        <svg 
          width="100" 
          height="100" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-success"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="mb-3">Order Placed Successfully!</h2>
      <p className="mb-4">Thank you for your order. You will receive an email confirmation shortly.</p>
      <button className="btn btn-danger" onClick={handleGoHome}>
        Go to Home
      </button>
    </div>
  );
};

export default OrderPlaced;
