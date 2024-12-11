import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NavBar from './components/NavBar';
import SubNavBar from './components/SubNavBar';
import MyProfile from './components/MyProfile';
import { Button, Container } from 'react-bootstrap';
import PurchaseHistory from './components/PurchaseHistory';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Home from './components/Home';
import Login from './components/Login';
import Items from './components/Items';
import OrderPlaced from './components/OrderPlaced';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import Wishlist from './components/Wishlist';
import SearchResults from './components/SaerchResults';
import AdminDashboard from './components/adminAccess/AdminDashboard';
import ManageLocations from './components/adminAccess/ManageLocations';
import ManageCategories from './components/adminAccess/ManageCategories';
import ManageAccess from './components/adminAccess/ManageAccess';
import ManageDetails from './components/adminAccess/ManageDetails';
import ManageDeliveryCharges from './components/adminAccess/ManageDeliveryCharges';
import ManageProducts from './components/adminAccess/ManageProducts';
import ManageOrders from './components/adminAccess/ManageOrders';
import DeliveryPartnerDashboard from './components/DeliveryPartner/DeliveryPartnerDashboard';
import ManageTimeSlots from './components/adminAccess/ManageTimeSlots';

function App() {
  const [activePage, setActivePage] = useState(localStorage.getItem('email') ? 'home' : 'login');
  const [activeTab, setActiveTab] = useState('all');
  const [categoryId, setCategoryId] = useState(0);
  const [city, setCity] = useState('Trichy');
  const [showCitySelection, setShowCitySelection] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [ cities, setCities] = useState([]);
  const [cartNumber, setCartNumber] = useState(0);
  const [appStatus, setAppStatus] = useState('ON');

  const handleCityChange = (event) => {
    const selectedCity = event.target.value;
    setCity(selectedCity);
    localStorage.setItem('userCity', selectedCity); 
    setShowCitySelection(false); 
    window.location.reload();
  };
  
  useEffect(() => {
    const fetchCities = async () => {
      const getLocRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({path: "/get/location" }),
      });
      let getLocData = await getLocRes.json();
      getLocData = JSON.parse(getLocData?.body) || [];
      let locations = getLocData?.map(loc => loc.name);
      setCities(locations);

      const cartItemsRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId: localStorage.getItem('userID'), path: "/get/cart"})
      });

      if (!cartItemsRes.ok) throw new Error("Failed to fetch cart items");

      let storedCart = await cartItemsRes.json();       
      setAppStatus(storedCart.app_status); 
      storedCart = JSON.parse(storedCart.body);
      setCartNumber(storedCart.reduce((sum, item) => sum + item.quantity, 0));
    }
    fetchCities();
    setTimeout(()=> {
      setLoading(false);
    }, 3000);
    const userCity = localStorage.getItem('userCity');
    if (!userCity) {
      setShowCitySelection(true);
    } else {
      setCity(userCity);
    }
  }, []);

  const toggleAppStatus = async () => {
    const updateAppStatusRes = await fetch(`https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({path: "/put/app_status", app_status: appStatus === 'ON' ? 'OFF' : 'ON'}),
    });
    let data = await updateAppStatusRes.json();
    if(data.message === 'App status updated') {
      setAppStatus(appStatus === 'ON' ? 'OFF' : 'ON');
    }
  }
  

  return (
    !isLoading ? (
      <Container fluid className="p-3">
      {
        activePage !== "login" ? <NavBar setActivePage={setActivePage} cartNumber={cartNumber} /> : null
      }
      <Button className='location-btn' onClick={() => setShowCitySelection(true)}>{city} {showCitySelection ? <IoIosArrowUp /> : <IoIosArrowDown />}</Button>
        {showCitySelection ? (
          <div className={`popup-container ${showCitySelection ? 'show' : 'hide'}`}>
            <div className="popup-box">
              <button className="close-button" onClick={() => {
                localStorage.setItem('userCity', city);
                setShowCitySelection(false);
              }}>&times;</button>
              <label>Select your city:</label>
              <select onChange={handleCityChange}>
                <option value={city}>{city}</option>
                {cities.filter(list => list!==city).map((list) => (
                  <option key={list} value={list}>{list}</option>
                ))}
              </select>
            </div>
          </div>
        ) : null}
      {
        activePage === "home" ? <>
          <SubNavBar setActiveTab={setActiveTab} activeTab={activeTab} setCategoryId={setCategoryId} />
          {
            activeTab === "all" ? <Home setActiveTab={setActiveTab} setCategoryId={setCategoryId} setCartNumber={setCartNumber} cartNumber={cartNumber} setActivePage={setActivePage} /> : <Items categoryId={categoryId} activeTab={activeTab} setCartNumber={setCartNumber} cartNumber={cartNumber} setActivePage={setActivePage} />
          }
        </> : 
        activePage === "my_profile" ? <MyProfile /> :
        activePage === "purchase_history" ? <PurchaseHistory /> :
        activePage === "cart" ? <Cart setActivePage={setActivePage} setCartNumber={setCartNumber} /> :
        activePage === "checkout" ? <Checkout setActivePage={setActivePage} city={city} setCartNumber={setCartNumber} /> :
        activePage === "login" ? <Login setActivePage={setActivePage} /> :
        activePage === "order_placed" ? <OrderPlaced setActivePage={setActivePage} /> :
        activePage === "wishlist" ? <Wishlist setCartNumber={setCartNumber} /> :
        activePage === "search" ? <SearchResults setCartNumber={setCartNumber} /> :
        activePage === "admin" ? <AdminDashboard setActivePage={setActivePage} appStatus={appStatus} toggleAppStatus={toggleAppStatus} /> :
        activePage === "manage-locations" ? <ManageLocations setActivePage={setActivePage} /> :
        activePage === "manage-categories" ? <ManageCategories setActivePage={setActivePage} /> :
        activePage === "manage-access" ? <ManageAccess setActivePage={setActivePage} /> :
        activePage === "manage-details" ? <ManageDetails setActivePage={setActivePage} /> :
        activePage === "manage-delivery-charges" ? <ManageDeliveryCharges setActivePage={setActivePage} /> :
        activePage === "manage-products" ? <ManageProducts setActivePage={setActivePage} /> :
        activePage === "manage-orders" ? <ManageOrders setActivePage={setActivePage} /> :
        activePage === "delivery_partner" ? <DeliveryPartnerDashboard setActivePage={setActivePage} /> :
        activePage === "time_slots" ? <ManageTimeSlots setActiveTab={setActiveTab} setActivePage={setActivePage} /> :
        null
      }      
    </Container>
    ) : (<div className='main-logo-loader'><div className="logo-container">
      <img className="logo" src="/assets/logo-bottom.PNG" alt="Logo" />
    </div></div>)
  );
}

export default App;
