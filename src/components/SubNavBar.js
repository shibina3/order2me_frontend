import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiCall } from '../config';

const SubNavbar = ({ setActiveTab, activeTab, setCategoryId }) => {
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    async function fetchTabs() {
      try {
        const data = await fetch(`${API_ENDPOINTS.GET_CATEGORIES}?location=${localStorage.getItem('userCity')}`);
        let result = await data.json();
        result = result.body || [];
        result = result.filter(cat => cat.location === localStorage.getItem('userCity'));
        result = result.sort((a,b) => a.id - b.id);
        console.log(result);
        setTabs(result);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    fetchTabs();
  },[])

  return (
    <div className="navbar-container">
      <div className="scrollable-navbar">
        <div
          className={`nav-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('all');
            setCategoryId(0);
          }}
        >
          All
        </div>
        {tabs?.sort((a,b) => a.order - b.order)?.map((tab, index) => (
          <div
            key={index}
            className={`nav-tab ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.name);
              setCategoryId(tab.id);
            }}
          >
            {tab.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubNavbar;
