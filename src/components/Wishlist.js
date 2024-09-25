import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { FaHeart } from "react-icons/fa";

export default function Wishlist() {
    const [cartItems, setCartItems] = useState({});
    const [isLoading, setLoading] = useState(true);
    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
              
            // Fetch items in the cart
            const cartRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({path: "/get/cart", id: localStorage.getItem('userID') })
            });
            let cartData = await cartRes.json();
            cartData = JSON.parse(cartData.body);
            
            const cartMap = cartData.reduce((acc, item) => {
                acc[item.id] = item.quantity;
                return acc;
            }, {});

            const allWishlistItemRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: localStorage.getItem('userID'),
                    path: "/get/wishlist"
                })
            });
            let allWishlistItems = await allWishlistItemRes.json();
            allWishlistItems = JSON.parse(allWishlistItems.body);
            allWishlistItems = allWishlistItems.length ? allWishlistItems : [];
            
            setWishlistItems(allWishlistItems);
            setCartItems(cartMap);
            setLoading(false);
        }
        fetchData();
    }, []);

    const handleQuantityChange = (itemId, event) => {
        const selectedQuantity = event.target.value;
        setWishlistItems(wishlistItems.map(item => 
            item.id === itemId
                ? { ...item, selectedQuantity }
                : item
        ));
    };

    const handleAddToCart = async (itemId) => {
        const item = wishlistItems.find(item => item.id === itemId);
        const selectedPriceDetail = item.price_details.find(detail => detail.quantity === item.selectedQuantity) || item.price_details[0];

        const cartItem = {
            user_id: localStorage.getItem('userID'),
            item_id: itemId,
            quantity: 1, 
            amount: selectedPriceDetail.amount,
            path: "/post/cart"
        };

        await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItem)
        });

        setCartItems({ ...cartItems, [itemId]: 1 });
    };

    const handleIncrement = async (itemId) => {
        const currentQuantity = cartItems[itemId] || 0;
        const newQuantity = currentQuantity + 1;

        const item = wishlistItems.find(item => item.id === itemId);
        const selectedPriceDetail = item.price_details.find(detail => detail.quantity === item.selectedQuantity) || item.price_details[0];

        await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: newQuantity, amount: selectedPriceDetail.amount, user_id: localStorage.getItem('userID'), id: itemId, path: "/put/cart" })
        });

        setCartItems({ ...cartItems, [itemId]: newQuantity });
    };

    const handleDecrement = async (itemId) => {
        const currentQuantity = cartItems[itemId] || 0;
        const newQuantity = currentQuantity - 1;

        const item = wishlistItems.find(item => item.id === itemId);
        const selectedPriceDetail = item.price_details.find(detail => detail.quantity === item.selectedQuantity) || item.price_details[0];

        if (newQuantity > 0) {
            await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: "/put/cart", quantity: newQuantity, amount: selectedPriceDetail.amount, user_id: localStorage.getItem('userID') })
            });
            setCartItems({ ...cartItems, [itemId]: newQuantity });
        } else {
            await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: "/delete/cart", user_id: localStorage.getItem('userID'), id: itemId })
            });
            const updatedCartItems = { ...cartItems };
            delete updatedCartItems[itemId];
            setCartItems(updatedCartItems);
        }
    };

    const handleAddRemoveWishist = async (itemId) => {
        const payload = {
            user_id: localStorage.getItem('userID'),
            item_id: itemId,
            path: "/delete/wishlist"
        };

        await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        setWishlistItems((prev) => prev.filter(wish => wish.id !== itemId));
    }

    return (
        !isLoading ? (<div className="items-container">
            {wishlistItems.length ? wishlistItems.map(item => {
                const selectedPriceDetail = item?.price_details?.find(detail => detail.quantity === item.selectedQuantity) || item.price_details[0];
                const cartQuantity = cartItems[item.id] || 0;                

                return (
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
                                <span className='items-wishlist wishlisted'>
                                    <FaHeart onClick={() => handleAddRemoveWishist(item.id, false)} />
                                </span>
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
                            {cartQuantity > 0 ? (
                                <div className="mt-2 cart-controls">
                                    <button className="quantity-btn" onClick={() => handleDecrement(item.id)}>-</button>
                                    <span className="cart-quantity">{cartQuantity}</span>
                                    <button className="quantity-btn" onClick={() => handleIncrement(item.id)}>+</button>
                                </div>
                            ) : (
                                <button className="mt-2 add-to-cart-btn" onClick={() => handleAddToCart(item.id)}>
                                    Add +
                                </button>
                            )}
                        </div>
                    </div>
                );
            }): <Alert>No items found</Alert>}
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
