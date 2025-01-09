import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';

export default function ClubCategories(props) {
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [clubbedCategories, setClubbedCategories] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            const allCategoriesRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ path: "/get/categories" }),
            });
            let allCategories = await allCategoriesRes.json();
            allCategories = JSON.parse(allCategories.body);
            allCategories = allCategories.sort((a, b) => a.order - b.order);

            const groupedCategories = allCategories.reduce((acc, category) => {
                acc[category.location] = acc[category.location] || [];
                acc[category.location].push(category);
                return acc;
              }, {});    
              
              setCategories(groupedCategories);

              const getClubbedCategoriesRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: "/clubbed/categories" }),
              });
              let clubbedCategories = await getClubbedCategoriesRes.json();
              clubbedCategories = JSON.parse(clubbedCategories.body);
              clubbedCategories = clubbedCategories.reduce((acc, category) => {
                acc[category.location] = acc[category.location] || [];
                acc[category.location].push(category);
                return acc;
              }, {});
              setClubbedCategories(clubbedCategories);
              console.log("clubbedCategories", clubbedCategories);
              
          
              let locRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: "/get/location" }),
              });
              let allLoc = await locRes.json();
              allLoc = JSON.parse(allLoc.body);
              allLoc = allLoc?.map(loc => loc.name);
              setLocations(allLoc);
        };
        fetchCategories();
    }, []);

    const handleClubCategories = async (location) => {
        const clubbedCategoriesRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ path: "/club/categories", categories: selectedCategories, location }),
        });
        let clubbedCategories = await clubbedCategoriesRes.json();
        clubbedCategories = JSON.parse(clubbedCategories.body);
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
        const unClubbedCategoriesRes = await fetch("https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ path: "/unclub/categories", id }),
        });
        let unClubbedCategories = await unClubbedCategoriesRes.json();
        unClubbedCategories = JSON.parse(unClubbedCategories.body);
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
