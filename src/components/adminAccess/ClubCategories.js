import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
import { API_ENDPOINTS, apiCall } from '../../config';

export default function ClubCategories(props) {
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [clubbedCategories, setClubbedCategories] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            const allCategoriesRes = await fetch(`${API_ENDPOINTS.GET_CATEGORIES}?location=${localStorage.getItem('userCity')}`);
            let allCategories = await allCategoriesRes.json();
            allCategories = allCategories.body || [];
            allCategories = allCategories.sort((a, b) => a.order - b.order);

            const groupedCategories = allCategories.reduce((acc, category) => {
                acc[category.location] = acc[category.location] || [];
                acc[category.location].push(category);
                return acc;
              }, {});    
              
              setCategories(groupedCategories);

              const getClubbedCategoriesRes = await apiCall('/clubbed/categories');
              let clubbedCategories = getClubbedCategoriesRes.body || [];
              clubbedCategories = clubbedCategories.reduce((acc, category) => {
                acc[category.location] = acc[category.location] || [];
                acc[category.location].push(category);
                return acc;
              }, {});
              setClubbedCategories(clubbedCategories);
              console.log("clubbedCategories", clubbedCategories);
              
          
              let locRes = await apiCall('/get/location');
              let allLoc = locRes.body || [];
              allLoc = allLoc?.map(loc => loc.name);
              setLocations(allLoc);
        };
        fetchCategories();
    }, []);

    const handleClubCategories = async (location) => {
        const clubbedCategoriesRes = await apiCall('/club/categories', {
            body: { categories: selectedCategories, location }
        });
        let clubbedCategories = clubbedCategoriesRes.body || [];
        clubbedCategories = clubbedCategories.reduce((acc, category) => {
            acc[category.location] = acc[category.location] || [];
            acc[category.location].push(category);
            return acc;
          }, {});
          console.log("clubbedCategories", clubbedCategories);
          
        setClubbedCategories(clubbedCategories);
        setSelectedCategories([]);
    }

    const handleUnClubCategories = async (id) => {
        const unClubbedCategoriesRes = await apiCall('/unclub/categories', {
            body: { id }
        });
        let unClubbedCategories = unClubbedCategoriesRes.body || [];
        unClubbedCategories = unClubbedCategories.reduce((acc, category) => {
            acc[category.location] = acc[category.location] || [];
            acc[category.location].push(category);
            return acc;
          }, {});
          console.log("unClubbedCategories", unClubbedCategories);
          
        setClubbedCategories(unClubbedCategories);
    }
  return (
    <>
      <div className="manage-categories">
        <nav aria-label="breadcrumb" className="breadcrumb-container">
          <ol className="breadcrumb d-flex">
            <li className="breadcrumb-item active" aria-current="page" onClick={() => props.setActivePage('admin')}>
              / Admin
            </li>
            <li className="breadcrumb-item active breadcrumb-secondary" aria-current="page">
              Club Categories
            </li>
          </ol>
        </nav>
        {/* show list of all categories in checkbox and allow users to select. Then Club button below. When clicked, the selected items shouldbe removed from the list and clubbed categories should be displayed. Keep a delete button near them */}
        <div className="manage-categories-container">
          {
            locations.map(loc => {
              return categories[loc]?.length ? (
                <div className="category-container">
                  <h3>{loc}</h3>
                  <div className="category-list">
                    {categories[loc]?.map(category => {
                      let allClubbedforLoc = clubbedCategories[loc]?.map(cat => JSON.parse(cat.categories)) || [];
                      allClubbedforLoc = allClubbedforLoc.flat(Infinity);
                      
                      return !(allClubbedforLoc.includes(category.id)) ? (
                        <div className="category" key={category.id}>
                          <input type="checkbox" id={category.id} name={category.name} value={category.name} onChange={() => setSelectedCategories([...selectedCategories, category.id])} />
                          <label htmlFor={category.id}>{category.name}</label>
                        </div>
                      ) : null
                    })}
                  </div>
                  <Button variant="primary" onClick={() => handleClubCategories(loc)}>Club</Button>
                  <div>
                    <hr />
                  <h5>Clubbed Categories</h5>
                    {
                      clubbedCategories[loc]?.map((clubbedCategory, index) => {
                        let categoryName = JSON.parse(clubbedCategory.categories);
                        categoryName = categories[loc].filter(category => categoryName.includes(category.id)).map(category => category.name).join(", ");
                        
                        return (
                          <div className="clubbed-category" key={index}>
                            <div>{categoryName}</div>
                            <div>
                              <Button variant="danger" onClick={() =>handleUnClubCategories(clubbedCategory.id)}>Delete</Button>
                            </div>
                          </div>
                        )
                      }) || <>No categories clubbed</>
                    }
                  </div>
                  <hr />
                </div>
              ) : null
            })
          }
        </div>
        </div>
    </>
  )
}
