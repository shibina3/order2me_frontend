// API Configuration
// Update this with your Hetzner server URL when deploying
// For production with HTTPS: https://order2me.in/api
// For local development: http://localhost:3001
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  
  // Auth
  REGISTER: `${API_BASE_URL}/register`,
  LOGIN: `${API_BASE_URL}/login`,
  
  // File Upload
  UPLOAD: `${API_BASE_URL}/upload`,
  
  // Categories
  GET_CATEGORIES: `${API_BASE_URL}/categories`,
  ADD_CATEGORY: `${API_BASE_URL}/add/categories`,
  UPDATE_CATEGORY: `${API_BASE_URL}/put/categories`,
  DELETE_CATEGORY: `${API_BASE_URL}/delete/categories`,
  
  // Items
  GET_ITEMS: `${API_BASE_URL}/get/items`,
  ADD_ITEM: `${API_BASE_URL}/post/items`,
  UPDATE_ITEM: `${API_BASE_URL}/put/items`,
  DELETE_ITEM: `${API_BASE_URL}/delete/items`,
  
  // Cart
  ADD_TO_CART: `${API_BASE_URL}/post/cart`,
  GET_CART: `${API_BASE_URL}/get/cart`,
  UPDATE_CART: `${API_BASE_URL}/put/cart`,
  DELETE_CART_ITEM: `${API_BASE_URL}/delete/cart`,
  CLEAR_CART: `${API_BASE_URL}/clear/cart`,
  
  // Orders
  CREATE_ORDER: `${API_BASE_URL}/post/orders`,
  GET_ORDERS: `${API_BASE_URL}/get/orders`,
  UPDATE_ORDER_STATUS: `${API_BASE_URL}/change/order_status`,
  GET_PURCHASES: `${API_BASE_URL}/get/purchases`,
  
  // Locations
  GET_LOCATIONS: `${API_BASE_URL}/get/location`,
  ADD_LOCATION: `${API_BASE_URL}/add/location`,
  DELETE_LOCATION: `${API_BASE_URL}/delete/location`,
  UPDATE_APP_STATUS: `${API_BASE_URL}/put/app_status`,
  
  // Wishlist
  GET_WISHLIST: `${API_BASE_URL}/get/wishlist`,
  ADD_WISHLIST: `${API_BASE_URL}/add/wishlist`,
  DELETE_WISHLIST: `${API_BASE_URL}/delete/wishlist`,
  
  // Delivery
  GET_DELIVERY_FEE: `${API_BASE_URL}/get/delivery_fee`,
  GET_DELIVERY_CHARGES: `${API_BASE_URL}/get/delivery_charges`,
  ADD_DELIVERY_FEE: `${API_BASE_URL}/add/delivery_fee`,
  UPDATE_DELIVERY_FEE: `${API_BASE_URL}/update/delivery_fee`,
  DELETE_DELIVERY_CHARGES: `${API_BASE_URL}/delete/delivery_charges`,
  
  // Time Slots
  GET_TIME_SLOTS: `${API_BASE_URL}/get/time_slots`,
  ADD_TIME_SLOT: `${API_BASE_URL}/add/time_slot`,
  DELETE_TIME_SLOT: `${API_BASE_URL}/delete/time_slot`,
  
  // Wallet
  ADD_WALLET: `${API_BASE_URL}/add/wallet`,
  REMOVE_WALLET: `${API_BASE_URL}/remove/wallet`,
  UPDATE_WALLET: `${API_BASE_URL}/update/wallet`,
  
  // Promo Codes
  GET_PROMO_CODES: `${API_BASE_URL}/get/promo-codes`,
  ADD_PROMO_CODE: `${API_BASE_URL}/add/promo-code`,
  DELETE_PROMO_CODE: `${API_BASE_URL}/delete/promo-code`,
  GET_PROMO_CODE: `${API_BASE_URL}/get/promo-code`,
  
  // Admin
  GET_USERS: `${API_BASE_URL}/get/users`,
  DELETE_USER: `${API_BASE_URL}/delete/user`,
  CHANGE_ROLES: `${API_BASE_URL}/change/roles`,
  GET_CONTACT_DETAILS: `${API_BASE_URL}/contact/details`,
  UPDATE_CONTACT_DETAILS: `${API_BASE_URL}/update/details`,
  VERIFY_OTP: `${API_BASE_URL}/verify/otp`,
  
  // Categories Management
  CLUB_CATEGORIES: `${API_BASE_URL}/club/categories`,
  GET_CLUBBED_CATEGORIES: `${API_BASE_URL}/clubbed/categories`,
  UNCLUB_CATEGORIES: `${API_BASE_URL}/unclub/categories`,
  UPDATE_CATEGORIES_ORDER: `${API_BASE_URL}/update/categories_order`,
  HIDE_UNHIDE_CATEGORY: `${API_BASE_URL}/hideOrUnhide/categories`,
};

// Helper function to make API calls with path (for backward compatibility)
export const apiCall = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  
  const data = await response.json();
  
  // Handle Lambda-style responses (with body property)
  if (data.body) {
    return {
      ...data,
      body: typeof data.body === 'string' ? JSON.parse(data.body) : data.body,
    };
  }
  
  return data;
};

export default API_ENDPOINTS;

