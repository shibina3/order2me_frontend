import React, { useState, useEffect } from 'react';

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
      data = data.filter(cat => cat.location === localStorage.getItem('userCity'))
      data = data.sort((a,b) => a.id - b.id)
      console.log(data);
      setTabs(data);
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
