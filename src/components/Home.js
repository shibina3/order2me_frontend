import React, { useRef, useState, useEffect } from 'react';
import { Carousel, Card, Button } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight, FaFacebook, FaInstagram, FaWhatsapp, FaRegHeart, FaHeart, FaRegArrowAltCircleRight } from 'react-icons/fa';

const HomePage = ({ setActiveTab, setCategoryId, setCartNumber, cartNumber, setActivePage }) => {
  const [popularItems, setPopularItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [details, setDetails] = useState([]);
  const [appStatus, setAppStatus] = useState('ON');
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Fetch all items
      const allItemsRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ path: "/get/items" })
      });
      let allItems = await allItemsRes.json();
      allItems = JSON.parse(allItems.body);
      allItems = allItems.filter(cat => cat.location === localStorage.getItem('userCity'))
      const popular_items = allItems.filter(item => item.popular_item);
      const new_arrivals = allItems.filter(item => item.new_arrival);

      setPopularItems(popular_items);
      setNewArrivals(new_arrivals);

      // Fetch all categories
      const allCategoriesRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ path: "/get/categories", location: localStorage.getItem('userCity') })
      });
      let allCategories = await allCategoriesRes.json();
      setAppStatus(allCategories.app_status);
      allCategories = JSON.parse(allCategories.body);
      allCategories = allCategories.filter(cat => cat.location === localStorage.getItem('userCity'))
      allCategories = allCategories.sort((a, b) => a.id - b.id);

      setCategories(allCategories);

      // Fetch cart items
      const cartRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: "/get/cart", userId: localStorage.getItem('userID'), location: localStorage.getItem('userCity') })
      });
      let cartData = await cartRes.json();
      cartData = JSON.parse(cartData.body);
      setCartNumber(cartData.reduce((sum, item) => sum + item.quantity, 0));

      const cartItemsMap = cartData.reduce((acc, item) => {
        acc[item.item_id] = item.quantity;
        return acc;
      }, {});
      setCartItems(cartItemsMap);

      // fetch contact details
      const contactDetRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: "/contact/details" })
      });
      let contactDetData = await contactDetRes.json();
      contactDetData = JSON.parse(contactDetData.body);
      setDetails(contactDetData);
    }

    fetchData();
    setLoading(false);
  }, [setCartNumber]);

  useEffect(() => {
    const fetchWishlist = async () => {

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
      allWishlistItems = allWishlistItems.length ? allWishlistItems.map(wish => wish.id) : [];
      setWishlistItems(allWishlistItems);
    }
    fetchWishlist();
  }, []);

  const popularRef = useRef(null);
  const categoriesRef = useRef(null);
  const newArrivalsRef = useRef(null);

  const handleScroll = (direction, ref) => {
    const container = ref.current;
    const scrollAmount = direction === 'left' ? -container.clientWidth : container.clientWidth;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleIncrement = async (itemId) => {
    const currentQuantity = cartItems[itemId] || 0;
    const newQuantity = currentQuantity + 1;

    const item = [...popularItems, ...newArrivals].find(item => item.id === itemId);
    item.selectedQuantity = selectedQuantities[itemId] ? item.price_details[selectedQuantities[itemId]].quantity : item.price_details[0].quantity;
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

    const item = [...popularItems, ...newArrivals].find(item => item.id === itemId);
    item.selectedQuantity = selectedQuantities[itemId] ? item.price_details[selectedQuantities[itemId]].quantity : item.price_details[0].quantity;
    const selectedPriceDetail = item.price_details.find(detail => detail.quantity === item.selectedQuantity) || item.price_details[0];

    if (newQuantity > 0) {
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
    } else {
      await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: localStorage.getItem('userID'), id: itemId,
          path: "/delete/cart"
        })
      });
      const updatedCartItems = { ...cartItems };
      delete updatedCartItems[itemId];
      setCartItems(updatedCartItems);
      setCartNumber(Object.values(updatedCartItems).reduce((sum, item) => sum + item, 0));
    }
  };

  const handleAddToCart = async (itemId) => {
    console.log("selectedQuantities", selectedQuantities, itemId);

    const item = [...popularItems, ...newArrivals].find(item => item.id === itemId);
    item.selectedQuantity = selectedQuantities[itemId] ? item.price_details[selectedQuantities[itemId]].quantity : item.price_details[0].quantity;

    const selectedPriceDetail = item.price_details.find(detail => detail.quantity === item.selectedQuantity) || item.price_details[0];
    console.log("item.price_details", item.price_details, selectedPriceDetail);

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
    if (addData.error) {
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
  const renderItemControls = (id) => (
    <div className="d-flex align-items-center">
      {cartItems[id] > 0 ? (
        <>
          <Button variant="outline-secondary" onClick={() => handleDecrement(id)}>-</Button>
          <span className="mx-2">{cartItems[id]}</span>
          <Button variant="outline-secondary" onClick={() => handleIncrement(id)}>+</Button>
        </>
      ) : (
        <Button variant="outline-secondary" onClick={() => handleAddToCart(id)}>Add +</Button>
      )}
    </div>
  );

  const handleAddRemoveWishist = async (itemId, wishlistFlag) => {
    const payload = {
      user_id: localStorage.getItem('userID'),
      item_id: itemId,
      path: wishlistFlag ? "/add/wishlist" : "/delete/wishlist"
    };

    await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (wishlistFlag) {
      setWishlistItems((prev) => [...prev, itemId]);
    } else {
      setWishlistItems((prev) => prev.filter(wish => wish !== itemId));
    }
  }

  const handleQuantityChange = (itemId, quantityIndex) => {
    setSelectedQuantities(prevState => ({
      ...prevState,
      [itemId]: quantityIndex
    }));
  };

  return (
    !isLoading ? (<div className="home-page">
      {/* Banner for Available Timings */}
      {
        appStatus === 'ON' ? <div className="timings-banner text-center my-3">
          <p>{details.find(detail => detail.key === 'banner')?.value}</p>
        </div> : <div className="timings-banner-off text-center text-danger my-3">
          <p>We are not currently accepting any orders!</p>
        </div>
      }
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

      {/* Banner for Offer Image */}
      <Carousel>
        <Carousel.Item interval={1000}>
          <img className='carousel-img' src="/assets/banner1.jpg" alt="Offer 1" />
        </Carousel.Item>
        <Carousel.Item interval={1000}>
          <img className='carousel-img' src="/assets/banner2.jpg" alt="Offer 2" />
        </Carousel.Item>
        <Carousel.Item interval={1000}>
          <img className='carousel-img' src="/assets/banner3.jpg" alt="Offer 3" />
        </Carousel.Item>
      </Carousel>

      {/* Carousel for Popular Items */}
      <div className="popular-items my-4">
        <div className="d-flex justify-content-between align-items-center">
          <h3>Most Popular Items</h3>
          <Button variant="link" onClick={() => setActiveTab('Popular Items')}>See All</Button>
        </div>
        <div className="carousel-container position-relative">
          <button className="carousel-control carousel-control-left" onClick={() => handleScroll('left', popularRef)} disabled={!popularItems.length}>
            <FaArrowLeft />
          </button>
          <div className="carousel-content" ref={popularRef}>
            {
              popularItems.length ? (
                popularItems.map((item, index) => {
                  const selectedQuantityIndex = selectedQuantities[item.id] || 0;
                  const selectedPriceDetail = item.price_details[selectedQuantityIndex];

                  return (
                    <Card key={index} style={{ width: '18rem', marginRight: '15px', height: '80%' }} className="d-inline-block carousel-item">
                      <Card.Img variant="top" className="cardImage" src={item.image_url} />
                      <Card.Body>
                        <Card.Title>
                          <span className='carousel-item-name'>{item.name}</span>
                          {
                            wishlistItems.includes(item.id) ?
                              <span className='items-wishlist wishlisted'>
                                <FaHeart onClick={() => handleAddRemoveWishist(item.id, false)} />
                              </span> :
                              <span className='items-wishlist not-wishlisted'>
                                <FaRegHeart onClick={() => handleAddRemoveWishist(item.id, true)} />
                              </span>
                          }
                        </Card.Title>
                        <Card.Text className='d-flex justify-content-between carousel-item-desc'>
                          ₹ {selectedPriceDetail.amount}
                          <select onChange={(e) => handleQuantityChange(item.id, e.target.value)} value={selectedQuantityIndex}>
                            {item.price_details.map((priceDetail, idx) => (
                              <option key={idx} value={idx}>{priceDetail.quantity}</option>
                            ))}
                          </select>
                          {item.stock === 'out-of-stock' ?
                            <div className='m-3 text-danger'><span>Out of stock</span></div> :
                            renderItemControls(item.id)
                          }
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  );
                })
              ) :
                <p>No popular items available.</p>
            }
          </div>
          <button className="carousel-control carousel-control-right" onClick={() => handleScroll('right', popularRef)} disabled={!popularItems.length}>
            <FaArrowRight />
          </button>
        </div>
      </div>

      <div className="offer-banner text-center my-3">
        <img src="/assets/banner3.jpg" alt="Special Offer" className="img-fluid" />
      </div>

      {/* Carousel for Categories */}
      <div className="categories-carousel my-4">
        <h3>Categories</h3>
        <div className="carousel-container position-relative">
          <button className="carousel-control carousel-control-left" onClick={() => handleScroll('left', categoriesRef)} disabled={!categories.length}>
            <FaArrowLeft />
          </button>
          <div className="carousel-content" ref={categoriesRef}>
            {categories.length ? (
              categories.map((category, index) => (
                <Card key={index} onClick={() => {
                  setActiveTab(category.name);
                  setCategoryId(category.id);
                }} style={{ width: '18rem', marginRight: '15px' }} className="d-inline-block carousel-item">
                  <Card.Img variant="top" className="cardImage" src={category.image_url} />
                  <Card.Body>
                    <Card.Title>{category.name}</Card.Title>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No categories available.</p>
            )}
          </div>
          <button className="carousel-control carousel-control-right" onClick={() => handleScroll('right', categoriesRef)} disabled={!categories.length}>
            <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Banner About the App */}
      <div className="app-info-banner text-center my-5">
        <p>Discover the freshest meat and seafood online. Quality guaranteed, with fast delivery to your doorstep.</p>
      </div>

      <div className="offer-banner text-center my-3">
        <img src="/assets/banner2.jpg" alt="Special Offer" className="img-fluid" />
      </div>

      {/* New Arrivals Cards */}
      <div className="new-arrivals my-4">
        <div className="d-flex justify-content-between align-items-center">
          <h3>New Arrivals</h3>
          <Button variant="link" onClick={() => setActiveTab('New Arrivals')}>See All</Button>
        </div>
        <div className="carousel-container position-relative">
          <button className="carousel-control carousel-control-left" onClick={() => handleScroll('left', newArrivalsRef)} disabled={!newArrivals.length}>
            <FaArrowLeft />
          </button>
          <div className="carousel-content" ref={newArrivalsRef}>
            {
              newArrivals.length ? (
                newArrivals.map((item, index) => {
                  const selectedQuantityIndex = selectedQuantities[item.id] || 0;
                  const selectedPriceDetail = item.price_details[selectedQuantityIndex];

                  return (
                    <Card key={index} style={{ width: '18rem', marginRight: '15px' }} className="d-inline-block carousel-item">
                      <Card.Img variant="top" className="cardImage" src={item.image_url} />
                      <Card.Body>
                        <Card.Title>
                          <span className='carousel-item-name'>{item.name}</span>
                          {
                            wishlistItems.includes(item.id) ?
                              <span className='items-wishlist wishlisted'>
                                <FaHeart onClick={() => handleAddRemoveWishist(item.id, false)} />
                              </span> :
                              <span className='items-wishlist not-wishlisted'>
                                <FaRegHeart onClick={() => handleAddRemoveWishist(item.id, true)} />
                              </span>
                          }
                        </Card.Title>
                        <Card.Text className='d-flex justify-content-between carousel-item-desc'>
                          ₹ {selectedPriceDetail.amount}
                          <select onChange={(e) => handleQuantityChange(item.id, e.target.value)} value={selectedQuantityIndex}>
                            {item.price_details.map((priceDetail, idx) => (
                              <option key={idx} value={idx}>{priceDetail.quantity}</option>
                            ))}
                          </select>
                          {item.stock === 'out-of-stock' ?
                            <div className='m-3 text-danger'><span>Out of stock</span></div> :
                            renderItemControls(item.id)
                          }
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  );
                })
              ) : (
                <p>No new arrivals available.</p>
              )
            }
          </div>
          <button className="carousel-control carousel-control-right" onClick={() => handleScroll('right', newArrivalsRef)} disabled={!newArrivals.length}>
            <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="footer text-center my-4">
        <div className="contact-info mb-3">
          <h4>Contact Us</h4>
          <p>Phone: <a href={`tel:${details?.find(det => det.key.trim() === "phone")?.value?.trim()}`}>{details?.find(det => det.key.trim() === "phone")?.value?.trim()}</a></p>
          <p>Email: <a href={`mailto:${details?.find(det => det.key.trim() === "mail")?.value?.trim()}`}>{details?.find(det => det.key.trim() === "mail")?.value?.trim()}</a></p>
          <p>Location: {details?.find(det => det.key.trim() === "address")?.value?.trim()}</p>
        </div>
        <div className="social-media mb-3">
          <a href={`${details?.find(det => det.key.trim() === "fb-link")?.value?.trim()}`} target='_blank' rel="noreferrer"><FaFacebook className="mx-2" /></a>
          <a href={`${details?.find(det => det.key.trim() === "insta-link")?.value?.trim()}`} target='_blank' rel="noreferrer"><FaInstagram className="mx-2" /></a>
          <a href={`${details?.find(det => det.key.trim() === "wp-link")?.value?.trim()}`} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp className="mx-2" />
          </a>
        </div>
        
        <p style={{fontSize: '12px'}}>Copyright &copy; Order2me Freshmart</p>
      </footer>
      {
        appStatus === 'OFF' ? <div className="timings-banner-off off-bg footer-banner text-center text-white my-3">
          <p>We are not currently accepting any orders!</p></div> :
          cartNumber > 0 ? <div className="footer-banner text-center my-3 text-white" onClick={() => setActivePage('cart')}>
            Proceed to checkout <FaRegArrowAltCircleRight className='ms-3' />
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
};

export default HomePage;
