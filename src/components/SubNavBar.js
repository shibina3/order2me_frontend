import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';

const SubNavbar = ({ setActiveTab, activeTab, setCategoryId }) => {
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    async function fetchTabs() {
      const res = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({path: "/get/categories"}),
      });
      let data = await res.json();
      data = JSON.parse(data.body);
      data = data.sort((a,b) => a.id - b.id)

      setTabs(data);
    }

    fetchTabs();
  },[])

  return (
    <Nav className="m-0 d-flex justify-content-center align-items-center border-bottom sub-navbar navbar-height">
        <Nav.Item className="nav-item">
        <div 
          className={`content-primary centered-text custom-nav-link ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('all');
            setCategoryId(0);
          }}
        >
          All
        </div>
      </Nav.Item>
      {
        tabs.length ? tabs.map((tab, index) => <Nav.Item key={index} className={`nav-item ${activeTab === tab.name ? 'active' : ''}`}>
          <div 
            className={`content-primary centered-text custom-nav-link ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.name);
              setCategoryId(tab.id);
            }}
          >
            {tab.name}
          </div>
        </Nav.Item>) : null
      }
    </Nav>
  );
};

export default SubNavbar;
