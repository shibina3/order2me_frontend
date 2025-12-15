import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { FaRegHeart, FaHeart, FaRegArrowAltCircleRight } from "react-icons/fa";
import { apiCall } from '../config';

export default function Items({ activeTab, categoryId, setCartNumber, cartNumber, setActivePage}) {
    const [items, setItems] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setLoading] = useState(true);    
    const [appStatus, setAppStatus] = useState('ON');
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        async function fetchData() {
            // Fetch items in the selected category
            setLoading(true);
            let itemsData;
            if(activeTab === "New Arrivals") {
                const itemsRes = await apiCall('/get/items');
                itemsData = itemsRes.body || [];
                itemsData = itemsData.filter(cat => cat.location === localStorage.getItem('userCity'));
                itemsData = itemsData.filter(item => item.new_arrival);
            } else if( activeTab === "Popular Items") {
                const itemsRes = await apiCall('/get/items');
                itemsData = itemsRes.body || [];
                itemsData = itemsData.filter(cat => cat.location === localStorage.getItem('userCity'));
                itemsData = itemsData.filter(item => item.popular_item);
            } else {
                const itemsRes = await apiCall('/get/items/category/categoryId', {
                    body: { categoryId }
                });
                itemsData = itemsRes.body || [];
            }

            // Fetch items in the cart
            const cartRes = await apiCall('/get/cart', {
                body: {
                    userId: localStorage.getItem('userID'),
                    location: localStorage.getItem('userCity')
                }
            });
            setAppStatus(cartRes.app_status);
            let cartData = cartRes.body || [];
            
            setCartNumber(cartData.reduce((sum, item) => sum + item.quantity, 0));
            
            const cartMap = cartData.reduce((acc, item) => {
                acc[item.item_id] = item.quantity;
                return acc;
            }, {});

            setItems(itemsData);
            setCartItems(cartMap);
            setLoading(false);
        }
        fetchData();
        // eslint-disable-next-line
    }, [categoryId, activeTab]);

    useEffect(() => {
        const fetchWishlist = async() => {
            try {
                const allWishlistItemRes = await apiCall('/get/wishlist', {
                    body: {
                        user_id: localStorage.getItem('userID')
                    }
            });
                let allWishlistItems = allWishlistItemRes.body || [];
            allWishlistItems = allWishlistItems.length ? allWishlistItems.map(wish => wish.id) : [];
            setWishlistItems(allWishlistItems);
            } catch (error) {
                console.error("Error fetching wishlist:", error);
            }
        }
        fetchWishlist();
    },[]);

    const handleQuantityChange = (itemId, event) => {
        const selectedQuantity = event.target.value;
        setItems(items.map(item => 
            item.id === itemId
                ? { ...item, selectedQuantity }
                : item
        ));
    };

    const handleAddToCart = async (itemId) => {
        const item = items.find(item => item.id === itemId);
        const selectedPriceDetail = item.price_details.find(detail => detail.quantity === item.selectedQuantity) || item.price_details[0];
  
        const cartItem = {
            user_id: localStorage.getItem('userID'),
            item_id: itemId,
            quantity: 1, 
            amount: selectedPriceDetail.amount,
            product_quantity: selectedPriceDetail.quantity,
            location: localStorage.getItem('userCity')
        };

        let addData = await apiCall('/post/cart', {
            body: cartItem
        });
        if(addData.error) {
            setShowPopup(true);
            localStorage.setItem('replacableItem', JSON.stringify(cartItem));
            return;
        }
        let newCartItems = { ...cartItems, [itemId]: 1 };
        setCartItems(newCartItems);
        setCartNumber(Object.values(newCartItems).reduce((sum, item) => sum + item, 0));
    };

    const handleIncrement = async (itemId) => {
        const currentQuantity = cartItems[itemId] || 0;
        const newQuantity = currentQuantity + 1;

        const item = items.find(item => item.id === itemId);
        const selectedPriceDetail = item.price_details.find(detail => detail.quantity === item.selectedQuantity) || item.price_details[0];

        await apiCall('/put/cart', {
            body: {
                quantity: newQuantity, 
                amount: selectedPriceDetail.amount, 
                product_quantity: selectedPriceDetail.quantity,
                user_id: localStorage.getItem('userID'), 
                itemId: itemId
            }
        });

        let newCartItems = { ...cartItems, [itemId]: newQuantity };
        setCartItems(newCartItems);
        setCartNumber(Object.values(newCartItems).reduce((sum, item) => sum + item, 0));
    };

    const handleDecrement = async (itemId) => {
        const currentQuantity = cartItems[itemId] || 0;
        const newQuantity = currentQuantity - 1;

        const item = items.find(item => item.id === itemId);
        const selectedPriceDetail = item.price_details.find(detail => detail.quantity === item.selectedQuantity) || item.price_details[0];

        if (newQuantity > 0) {
            await apiCall('/put/cart', {
                body: {
                    quantity: newQuantity, 
                    amount: selectedPriceDetail.amount, 
                    product_quantity: selectedPriceDetail.quantity,
                    user_id: localStorage.getItem('userID'),
                    itemId: itemId
                }
            });
            let newCartItems = { ...cartItems, [itemId]: newQuantity };
            setCartItems(newCartItems);
            setCartNumber(Object.values(newCartItems).reduce((sum, item) => sum + item, 0));
        } else {
            await apiCall('/delete/cart', {
                body: {
                    user_id: localStorage.getItem('userID'),
                    id: itemId
                }
            });
            const updatedCartItems = { ...cartItems };
            delete updatedCartItems[itemId];
            setCartItems(updatedCartItems);
            setCartNumber(Object.values(updatedCartItems).reduce((sum, item) => sum + item, 0));
        }
    };

    const handleAddRemoveWishist = async (itemId, wishlistFlag) => {
        const payload = {
            user_id: localStorage.getItem('userID'),
            item_id: itemId
        };

        await apiCall(wishlistFlag ? '/add/wishlist' : '/delete/wishlist', {
            body: payload
        });

        if (wishlistFlag) {
            setWishlistItems((prev) => [...prev, itemId]);
        } else {
            setWishlistItems((prev) => prev.filter(wish => wish !== itemId));
        }
    }

    const handleClearAndAddToCart = async () => {
        setShowPopup(false)
        const cartItem = JSON.parse(localStorage.getItem('replacableItem'));

        let addData = await apiCall('/clear/post/cart', {
            body: cartItem
        });
        if(addData.error) {
            return;
        }
        let newCartItems = { [cartItem.item_id]: 1 };
        setCartItems(newCartItems);
        setCartNumber(Object.values(newCartItems).reduce((sum, item) => sum + item, 0));
    }

    return (
        !isLoading ? (<div className="items-container">
            {items.length ? items.map(item => {
                const selectedPriceDetail = item.price_details.find(detail => detail.quantity === item.selectedQuantity) || item.price_details[0];
                const cartQuantity = cartItems[item.id] || 0;

                return (
                    <>
                        <div key={item.id} className="item-card">
                        <div className="item-image">
                            {item.popular_item && item.new_arrival ? (
                                <div className="item-flag flag-recommended">Recommended</div>
                            ) : item.popular_item ? (
                                <div className="item-flag flag-popular">Popular</div>
                            ) : item.new_arrival ? (
                                <div className="item-flag flag-new-arrival">New Arrival</div>
                            ) : null}
                            <img src={item.image_url} alt={item.name} />
                        </div>
                        <div className="item-details">
                            <div className='wishlist-cont'>
                                {
                                    wishlistItems.includes(item.id) ? 
                                    <span className='items-wishlist wishlisted'>
                                        <FaHeart onClick={() => handleAddRemoveWishist(item.id, false)} />
                                    </span> : 
                                    <span className='items-wishlist'>
                                        <FaRegHeart onClick={() => handleAddRemoveWishist(item.id, true)} />
                                    </span>
                                }
                            </div>
                            <h3 className='item-title'>{item.name}</h3>
                            <div className="dropdown-container">
                                <select
                                    defaultValue={item.price_details[0].quantity}
                                    onChange={(event) => handleQuantityChange(item.id, event)}
                                >
                                    {item.price_details.map((priceDetail, index) => (
                                        <option key={index} value={priceDetail.quantity}>
                                            {priceDetail.quantity}
                                        </option>
                                    ))}
                                </select>
                                <span className="amount-display">
                                    ₹{selectedPriceDetail.amount}
                                </span>
                            </div>
                            {item.stock === 'out-of-stock' ? <div className='m-3 text-danger'><span>Out of stock</span></div> :
                            cartQuantity > 0 ? (
                                <div className="mt-2 cart-controls">
                                    <button className="quantity-btn" onClick={() => handleDecrement(item.id)}>-</button>
                                    <span className="cart-quantity">{cartQuantity}</span>
                                    <button className="quantity-btn" onClick={() => handleIncrement(item.id)}>+</button>
                                </div>
                            ) : (
                                <button className="mt-2 add-to-cart-btn fs-6" onClick={() => handleAddToCart(item.id)}>
                                    Add +
                                </button>
                            )}
                        </div>
                    </div>
                    {
                        showPopup ? <div className="popup-container">
                            <div className="popup">
                                <div className="popup-content bg-white p-3 m-3">
                                    <p style={{fontSize: '12px', textAlign: 'center'}}>You cannot purchase this item with the items currently in your cart. Would you like to clear your cart and add this instead?</p>
                                    <div className='d-flex justify-content-center'>
                                        <button className="btn btn-success" onClick={handleClearAndAddToCart}>Yes</button>
                                        <button className="btn btn-warning" onClick={() => setShowPopup(false)}>No</button>
                                    </div>
                                </div>
                            </div>
                        </div> : null
                    }
                    </>
                );
            }): <Alert>No items found</Alert>}
            {
            appStatus === 'OFF' ? <div className="timings-banner-off off-bg footer-banner text-center text-white my-3">
                <p>We are not currently accepting any orders!</p></div> : 
            cartNumber > 0 ? <div className="footer-banner text-center my-3 text-white" onClick={() => setActivePage('cart')}>
            Proceed to checkout <FaRegArrowAltCircleRight className='ms-3'/>
            </div> : null
            }
        </div>) : (<div className='loader-container'><div className="loader">
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
}
