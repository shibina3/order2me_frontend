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

function App() {
  const [activePage, setActivePage] = useState(localStorage.getItem('email') ? 'home' : 'login');
  const [activeTab, setActiveTab] = useState('all');
  const [categoryId, setCategoryId] = useState(0);
  const [city, setCity] = useState('');
  const [showCitySelection, setShowCitySelection] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const cities = ['Chennai', 'Madurai', 'Trinelveli', 'Trichy', 'Salem'];
  const handleCityChange = (event) => {
    const selectedCity = event.target.value;
    setCity(selectedCity);
    localStorage.setItem('userCity', selectedCity); // Save in localStorage
    setShowCitySelection(false); // Hide city selection dropdown
  };
  
  useEffect(() => {
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
  

  return (
    !isLoading ? (
      <Container fluid className="p-3">
      {
        activePage !== "login" ? <NavBar setActivePage={setActivePage} /> : null
      }
      <Button className='location-btn' onClick={() => setShowCitySelection(true)}>{city} {showCitySelection ? <IoIosArrowUp /> : <IoIosArrowDown />}</Button>
        {showCitySelection ? (
          <div className={`popup-container ${showCitySelection ? 'show' : 'hide'}`}>
            <div className="popup-box">
              <button className="close-button" onClick={() => setShowCitySelection(false)}>&times;</button>
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
            activeTab === "all" ? <Home setActiveTab={setActiveTab} setCategoryId={setCategoryId} /> : <Items categoryId={categoryId} activeTab={activeTab} />
          }
        </> : 
        activePage === "my_profile" ? <MyProfile /> :
        activePage === "purchase_history" ? <PurchaseHistory /> :
        activePage === "cart" ? <Cart setActivePage={setActivePage} /> :
        activePage === "checkout" ? <Checkout setActivePage={setActivePage} city={city} /> :
        activePage === "login" ? <Login setActivePage={setActivePage} /> :
        activePage === "order_placed" ? <OrderPlaced setActivePage={setActivePage} /> :
        activePage === "wishlist" ? <Wishlist /> :
        activePage === "search" ? <SearchResults /> :
        null
      }      
    </Container>
    ) : (<div className='main-logo-loader'><div className="logo-container">
      <img className="logo" src="/assets/logo-bottom.PNG" alt="Logo" />
    </div></div>)
  );
}

export default App;
