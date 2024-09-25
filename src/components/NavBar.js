import React, { useState, useRef, useEffect  } from 'react';
import { Navbar, Nav, Form, Button } from 'react-bootstrap';
import { FaSearch, FaShoppingCart, FaSignInAlt, FaTimes, FaBars, FaHeart } from 'react-icons/fa';
import { IoHome } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { BsCartCheckFill } from "react-icons/bs";
import { IoMdLogOut } from "react-icons/io";

const AppNavbar = (props) => {
  const [showBreadcrumb, setShowBreadcrumb] = useState(false);
  const [isLogoutPopup, setShowLogoutPopup] = useState(false);
  const sidebarRef = useRef(null);

  const toggleBreadcrumb = () => {
    setShowBreadcrumb(!showBreadcrumb);
  }

  const setPage = (page) => {
    props.setActivePage(page);
  }

  const showLogOutPopup = () => {
    toggleBreadcrumb();
    setShowLogoutPopup(true);
  }

  const logOut = () => {
    localStorage.removeItem('email');
    setPage('login');
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && showBreadcrumb) {
        setShowBreadcrumb(false);
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef, showBreadcrumb]);

  return (
    <>
      <Navbar expand="lg" className="top-navbar border-bottom">
        <Navbar.Brand className="text-start font-weight-bold" onClick={() => setPage("home")}>
          <img src="/assets/logo-side.png" alt="logo-side" className='logo-side' />
        </Navbar.Brand>
        <Button
          className="border-0 navbar-toggler"
          aria-controls="custom-sidebar"
          onClick={toggleBreadcrumb}
        >
          <FaBars />
        </Button>
        <Button className="no-bg mr-2 btn-link content-primary d-block d-sm-none order-3" onClick={() => setPage("search")}><FaSearch /></Button>
        <div className="d-none d-lg-flex justify-content-between w-100">
          <Nav className="mx-auto gap-5">
            <Nav.Link onClick={() => setPage('home')} className="content-primary">Home</Nav.Link>
            <Nav.Link onClick={() => setPage('my_profile')} className="content-primary">My Profile</Nav.Link>
            <Nav.Link onClick={() => setPage('purchase_history')} className="content-primary">My Orders</Nav.Link>
            <Nav.Link onClick={() => setPage('wishlist')} className="content-primary">My Wishlist</Nav.Link>
            <Nav.Link onClick={() => setPage('cart')} className="content-primary">Cart</Nav.Link>
          </Nav>
            <Form className="ml-auto d-flex align-items-center">
              <Button className="no-bg mr-2 btn-link content-primary d-none d-lg-block"><FaSearch /></Button>
              <Button className="no-bg mr-2 btn-link content-primary d-none d-lg-block" onClick={() => setPage("cart")}>
                <FaShoppingCart />
              </Button>
              <Button className="no-bg btn-link content-primary d-none d-lg-block" onClick={logOut}>
                <FaSignInAlt />
              </Button>
            </Form>
        </div>
      </Navbar>

      {showBreadcrumb && (
        <div className="side-popup" ref={sidebarRef}>
          <div className="popup-content">
            <Button className="close-btn m-0 p-2" onClick={toggleBreadcrumb}>
              <FaTimes />
            </Button>
            <div className="popup-header text-center">
              {localStorage.getItem('email') ? (
                <h5 className="text-start">Welcome {localStorage.getItem('name')}</h5>
              ) : (
                <h5>Sign In / Login</h5>
              )}
            </div>
            <Nav className="flex-column">
              <Nav.Link onClick={() => {setPage('home');toggleBreadcrumb();}} className="content-primary"><IoHome className='sidebar-icons' /> Home</Nav.Link>
              <Nav.Link onClick={() => {setPage('my_profile');toggleBreadcrumb();}} className="content-primary"><CgProfile className='sidebar-icons' /> My Profile</Nav.Link>
              <Nav.Link onClick={() => {setPage('purchase_history');toggleBreadcrumb();}} className="content-primary"><BsCartCheckFill className='sidebar-icons' />My Orders</Nav.Link>
              <Nav.Link onClick={() => {setPage('wishlist');toggleBreadcrumb();}} className="content-primary"><FaHeart className='sidebar-icons' />My Wishlist</Nav.Link>
              <Nav.Link onClick={() => {setPage('cart');toggleBreadcrumb();}} className="content-primary"><FaShoppingCart className='sidebar-icons' />Cart</Nav.Link>
              <Nav.Link onClick={showLogOutPopup} className="content-primary"><IoMdLogOut className='sidebar-icons'  />Logout</Nav.Link>
            </Nav>
          </div>
        </div>
      )}

      {isLogoutPopup ? <div id="logoutModal" className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to logout?</h3>
            <button className="btn btn-confirm" onClick={logOut}>Yes, Logout</button>
            <button className="btn btn-cancel" onClick={() => setShowLogoutPopup(false)}>Cancel</button>
          </div>
        </div> : null}
    </>

  );
};

export default AppNavbar;
