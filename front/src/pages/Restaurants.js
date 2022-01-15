import React, { useState, useContext, useEffect, useRef } from "react";
import { FetchedList, ListOfItems } from "../components/List";
import { getAllRestaurants, searchRestaurant } from "../API/Restaurants";
import Search from "../components/Search";
import "../styles/Restaurants.css";
import "../styles/Text.css";

function RestaurantsPage({ user, setRestaurant, button, setForReview }) {
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [plus, setPlus] = useState(true);
  const inputRef = useRef(null);
  const limit = 3;
  // setTimeout(() => console.log(inputRef.current.value), 2000);

  const updateItems = async () => {
    getAllRestaurants({ limit: limit, skip })
      .then(({ data }) => {
        if (items != null) setItems(items.concat(data));
        else setItems(data);
        if (data.length < limit) setPlus(false);
      })
      .catch((err) => console.log(err));
  };
  const searchRestaurantByName = async (name) => {
    searchRestaurant(name, { limit: limit, skip: 0 }).then(({ data }) => {
      if (!data || !(data instanceof Array)) alert("error on search!");
      setItems(data);
    });
  };
  useEffect(() => {
    updateItems();
  }, []);

  useEffect(() => {
    updateItems();
  }, [skip]);

  var welcomeText;
  if (items.length != 0)
    welcomeText = "Choose the restaurant from which you want to order food";
  else
    welcomeText = "Sorry, there are no restaurants available, try again later";
  let searchTimer;
  return (
    <>
      <div className="RestWrapper">
        <div className="welcomeText">{welcomeText}</div>
        <div className="search-container">
          <div class="ui category search">
            <div class="ui icon input">
              <input
                ref={inputRef}
                onChange={(e) => {
                  if (searchTimer) clearTimeout(searchTimer);
                  inputRef.current.value = e.target.value;
                  setTimeout(() => {
                    const searchTerm = inputRef.current.value
                      ? inputRef.current.value
                      : ".";
                    searchRestaurantByName(
                      inputRef.current.value ? inputRef.current.value : "."
                    );
                  }, 2000);
                }}
                onKeyPress={(e) => {
                  if (searchTimer) clearTimeout(searchTimer);
                  console.log();
                  const searchTerm = inputRef.current.value
                    ? inputRef.current.value
                    : ".";
                  searchRestaurantByName(
                    inputRef.current.value ? inputRef.current.value : "."
                  );
                }}
                class="prompt"
                type="text"
                placeholder={`Search restaurants...`}
              />
              <i class="search icon"></i>
            </div>
            <div class="results"></div>
          </div>
        </div>
        <ListOfItems
          button={button}
          itemSelected={setRestaurant}
          setForReview={setForReview}
        >
          {items}
        </ListOfItems>
        <div className="plusIconWrapper">
          {plus ? (
            <i
              class="big plus circle icon"
              style={{ cursor: "pointer" }}
              onClick={() => setSkip(skip + limit)}
            ></i>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
  return (
    <FetchedList
      fetchItems={getAllRestaurants}
      itemSelected={setRestaurant}
      user={user}
    />
  );
}

export default RestaurantsPage;
