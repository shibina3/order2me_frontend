import React, { useRef, useState, useEffect } from 'react';
import { Carousel, Card, Button } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight, FaFacebook, FaInstagram, FaWhatsapp, FaRegHeart, FaHeart } from 'react-icons/fa';

const HomePage = ({setActiveTab, setCategoryId}) => {
  const [popularItems, setPopularItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch all items
      const allItemsRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({path: "/get/items"})
      });
      let allItems = await allItemsRes.json();
      allItems = JSON.parse(allItems.body);

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
        body: JSON.stringify({path: "/get/categories"})
      });
      let allCategories = await allCategoriesRes.json();
      allCategories = JSON.parse(allCategories.body);
      
      allCategories = allCategories.sort((a, b) => a.id - b.id);

      setCategories(allCategories);

      // Fetch cart items
      const cartRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({path: "/get/cart", userId: localStorage.getItem('userID')})
      });
      let cartData = await cartRes.json();
      cartData = JSON.parse(cartData.body);
      
      const cartItemsMap = cartData.reduce((acc, item) => {
        acc[item.item_id] = item.quantity;
        return acc;
      }, {});
      setCartItems(cartItemsMap);
    }

    fetchData();
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchWishlist = async() => {

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
  },[]);

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
        itemId: itemId,
        path: "/put/cart"
      })
    });

    setCartItems({ ...cartItems, [itemId]: newQuantity });
  };

  const handleDecrement = async (itemId) => {
    const currentQuantity = cartItems[itemId] || 0;
    const newQuantity = currentQuantity - 1;

    const item = [...popularItems, ...newArrivals].find(item => item.id === itemId);
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
          itemId: itemId,
          path: "/put/cart"
        })
      });
      setCartItems({ ...cartItems, [itemId]: newQuantity });
    } else {
      await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: localStorage.getItem('userID'), id: itemId,
          path: "/delete/cart" })
      });
      const updatedCartItems = { ...cartItems };
      delete updatedCartItems[itemId];
      setCartItems(updatedCartItems);
    }
  };

  const handleAddToCart = async (itemId) => {
    const item = [...popularItems, ...newArrivals].find(item => item.id === itemId);
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

  return (
    !isLoading ? (<div className="home-page">
      {/* Banner for Available Timings */}
      <div className="timings-banner text-center my-3">
        <p>Order Acceptance Timings: Mon-Fri: 9 AM - 8 PM, Sat-Sun: 10 AM - 6 PM</p>
      </div>

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
          <Button variant="link" onClick={()=> setActiveTab('Popular Items')}>See All</Button>
        </div>
        <div className="carousel-container position-relative">
          <button className="carousel-control carousel-control-left" onClick={() => handleScroll('left', popularRef)} disabled={!popularItems.length}>
            <FaArrowLeft />
          </button>
          <div className="carousel-content" ref={popularRef}>
            {popularItems.length ? (
              popularItems.map((item, index) => (
                <Card key={index} style={{ width: '18rem', marginRight: '15px' }} className="d-inline-block carousel-item">
                  <Card.Img variant="top" className="cardImage" src={item.image_url} />
                  <Card.Body>
                    <Card.Title>{item.name}
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
                    <Card.Text className='d-flex justify-content-between'>{item.description}{renderItemControls(item.id)}</Card.Text>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No popular items available.</p>
            )}
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
                <Card key={index} onClick={()=> {
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
          <Button variant="link" onClick={()=> setActiveTab('New Arrivals')}>See All</Button>
        </div>
        <div className="carousel-container position-relative">
          <button className="carousel-control carousel-control-left" onClick={() => handleScroll('left', newArrivalsRef)} disabled={!newArrivals.length}>
            <FaArrowLeft />
          </button>
          <div className="carousel-content" ref={newArrivalsRef}>
            {newArrivals.length ? (
              newArrivals.map((item, index) => (
                <Card key={index} style={{ width: '18rem', marginRight: '15px' }} className="d-inline-block carousel-item">
                  <Card.Img variant="top" className="cardImage" src={item.image_url} />
                  <Card.Body>
                    <Card.Title>{item.name}
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
                    <Card.Text className='d-flex justify-content-between'>{item.description}{renderItemControls(item.id)}</Card.Text>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No new arrivals available.</p>
            )}
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
          <p>Phone: <a href="tel:+919487981496">+91 94879 81496</a></p>
          <p>Email: <a href="mailto:contact@order2me.com">contact@order2me.com</a></p>
          <p>Location: KK Nagar, Trichy</p>
        </div>
        <div className="social-media mb-3">
          <a href='https://www.facebook.com/Order2meonline' target='_blank'><FaFacebook className="mx-2" /></a>
          <a href="https://www.instagram.com/order2me_freshmart/" target='_blank'><FaInstagram className="mx-2" /></a>
          <a href="https://wa.me/919487981496?text=Hello%20Order2me" target="_blank" rel="noopener noreferrer">
            <FaWhatsapp className="mx-2" />
          </a>
        </div>
        <div className="designer-credit">
          <p>Page Designed By <span className='content-primary'>Shibina</span></p>
          <p>Contact <span className='content-primary'>shibinashibi1507@gmail.com</span></p>
        </div>
      </footer>
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
