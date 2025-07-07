import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { FaHeart } from "react-icons/fa";

export default function Wishlist({ setCartNumber }) {
    const [cartItems, setCartItems] = useState({});
    const [isLoading, setLoading] = useState(true);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
              
            // Fetch items in the cart
            const cartRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({path: "/get/cart", userId: localStorage.getItem('userID'), location: localStorage.getItem('userCity') })
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
            setCartNumber(Object.values(cartMap).reduce((sum, item) => sum + item, 0));
            setLoading(false);
        }
        fetchData();
    }, [setCartNumber]);

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
        console.log("item.price_details", item.price_details);
        
        const selectedPriceDetail = item.price_details.find(detail => detail.quantity === item.selectedQuantity) || item.price_details[0];

        const cartItem = {
            user_id: localStorage.getItem('userID'),
            item_id: itemId,
            quantity: 1, 
            amount: selectedPriceDetail.amount,
            product_quantity: selectedPriceDetail.quantity,
            path: "/post/cart",
            location: localStorage.getItem('userCity')
        };

        let addRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItem)
        });
        let addData = await addRes.json();
        addData = JSON.parse(addData.body);
        if(addData.error) {
            setShowPopup(true);
            localStorage.setItem('replacableItem', JSON.stringify(cartItem));
            return;
        }
        let newCartItems = { ...cartItems, [itemId]: 1 };
        setCartItems(newCartItems);
        setCartNumber(Object.values(newCartItems).reduce((sum, item) => sum + item, 0));
    };

    const handleClearAndAddToCart = async () => {
        setShowPopup(false)
        const cartItem = JSON.parse(localStorage.getItem('replacableItem'));
        cartItem.path = "/clear/post/cart";

        let addRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItem)
        });

        let addData = await addRes.json();
        addData = JSON.parse(addData.body);
        if(addData.error) {
            return;
        }
        let newCartItems = { [cartItem.item_id]: 1 };
        setCartItems(newCartItems);
        setCartNumber(Object.values(newCartItems).reduce((sum, item) => sum + item, 0));
    }

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
            body: JSON.stringify({ 
                quantity: newQuantity, 
                amount: selectedPriceDetail.amount, 
                user_id: localStorage.getItem('userID'), 
                product_quantity: selectedPriceDetail.quantity,
                itemId: itemId, 
                path: "/put/cart" 
            })
        });
        let newCartItems = { ...cartItems, [itemId]: newQuantity };
        setCartItems(newCartItems);
        setCartNumber(Object.values(newCartItems).reduce((sum, item) => sum + item, 0));
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
                body: JSON.stringify({ 
                    path: "/put/cart", 
                    quantity: newQuantity, 
                    amount: selectedPriceDetail.amount, 
                    product_quantity: selectedPriceDetail.quantity,
                    itemId: itemId,
                    user_id: localStorage.getItem('userID') 
                })
            });
            let newCartItems = { ...cartItems, [itemId]: newQuantity };
            setCartItems(newCartItems);
            setCartNumber(Object.values(newCartItems).reduce((sum, item) => sum + item, 0));
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
            setCartNumber(Object.values(updatedCartItems).reduce((sum, item) => sum + item, 0));
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
            {
                showPopup ? <div className="popup-container">
                    <div className="popup">
                        <div className="popup-content bg-white p-3 m-3">
                            <p style={{ fontSize: '12px', textAlign: 'center' }}>You cannot purchase this item with the items currently in your cart. Would you like to clear your cart and add this instead?</p>
                            <div className='d-flex justify-content-center'>
                                <button className="btn btn-success" onClick={handleClearAndAddToCart}>Yes</button>
                                <button className="btn btn-warning" onClick={() => setShowPopup(false)}>No</button>
                            </div>
                        </div>
                    </div>
                </div> : null
            }
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
                            {item.stock === 'out-of-stock' ? <div className='m-3 text-danger'><span>Out of stock</span></div> :
                            cartQuantity > 0 ? (
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
