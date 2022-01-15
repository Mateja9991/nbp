import React, { useState, useContext, useEffect, useRef } from "react";
import { FetchedList, ListOfItems } from "../components/List";
import { Item } from "../components/Card";
import {
  getFoodFromMenu,
  addFoodToRestaurant,
  deleteRestaurantsFood,
  addFoodToPendingOrder,
  delFoodFromPendingOrder,
  getAvailableFoodTypes,
  updateRestaurantsFood,
  getFoodByID,
} from "../API/Restaurants";
import { ItemMeta, List, Dropdown } from "semantic-ui-react";

import { createOrder } from "../API/Orders";
import { Button } from "../components/Button";
import { useSocket } from "../context/socketProvider";
import { getUserById } from "../API";

function RestaurantMenuPage({ role, user, restId }) {
  const socket = useSocket();
  const [addFlag, setAddFlag] = useState(false);
  const [updateFlag, setUpdateFlag] = useState(false);
  const [skip, setSkip] = useState(0);
  const [items, setItems] = useState([]);
  const [plus, setPlus] = useState(true);
  const [idSel, setIdSel] = useState(null);
  const [sortValue, setSortValue] = useState("ASC");
  const [availableTypes, setAvailableTypes] = useState([]);
  const [foodType, setFoodType] = useState(null);
  const limit = 3;

  const icon = `big ${restId == user.id ? "delete" : "plus"} icon`;
  const delBtnClicked = async (id) => {
    const response = await deleteRestaurantsFood(id);
    if (response.status == 200) {
      setItems(response.data);
    } else {
      console.log("Error");
    }
  };
  const addFoodToOrder = async (id) => {
    const { data } = await addFoodToPendingOrder(restId, [id]);
  };
  const onBtnClick = user.id == restId ? delBtnClicked : addFoodToOrder;

  const onSubmitAddFood = async (event) => {
    event.preventDefault();
    const {
      target: { name, price, type },
    } = event;
    if (name.value == "" || price.value == "" || type.value == "")
      alert("Morate popuniti sva polja.");
    else {
      const food = {
        name: name.value,
        price: price.value,
        type: type.value,
      };
      const { data } = await addFoodToRestaurant(food);

      setItems(data);
      setAddFlag(false);
    }
  };

  const onSubmitUpdateFood = async (event, callback) => {
    event.preventDefault();
    const {
      target: { name, price, type, file },
    } = event;
    if (name.value || price.value || type.value || (file && file.value)) {
      const formData = new FormData();
      var food = {};
      if (name.value != "") {
        food.name = name.value;
        formData.append("name", name.value);
      }
      if (price.value != "") {
        food.price = price.value;
        formData.append("price", price.value);
      }
      if (type.value != "") {
        food.type = type.value;
        formData.append("type", type.value);
      }
      if (file && file.value) {
        console.log("FOOD IMG ADD");
        formData.append("foodImg", file.files[0]);
        console.log("foodImg", file.files[0]);
      }
      const response = await updateRestaurantsFood(idSel.id, formData);
      if (response && response.status == 200) {
        setIdSel(null);
        const { data } = response;
        console.log(data);
        setItems(items.map((item) => (item.id == data.id ? data : item)));
      }
    } else alert("Morate uneti bar jedan podatak za azuriranje.");
  };

  const getFood = async (id) => {
    getFoodByID(id)
      .then(({ data }) => {
        console.log(data);
        console.log(items);
        setIdSel(data);
      })
      .catch((err) => console.log(err));
  };

  const AddFoodForm = ({ onSubmitHandler, name, price, type, addFood }) => (
    <div className="formWrapper">
      <form id="test" class="ui form" method="POST" onSubmit={onSubmitHandler}>
        <div id="form-segment" class="ui center aligned attached segment">
          <div class="field">
            <div class="xWrapper">
              <i
                class="large x icon"
                onClick={() => (addFood ? setAddFlag(false) : setIdSel(null))}
              ></i>
            </div>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" placeholder={name} />
          </div>
          <div class="field">
            <label for="price">Price</label>
            <input type="number" id="price" name="price" placeholder={price} />
          </div>
          <div class="field">
            <label for="type">Type:</label>
            <input type="text" id="type" name="type" placeholder={type} />
          </div>
          {idSel ? (
            <div class="field">
              <input
                name="file"
                type="file"
                onChange={(e) => {
                  console.log(e.target.files);
                }}
              />
            </div>
          ) : (
            ""
          )}
        </div>
        <button class="ui bottom attached fluid button" type="submit">
          {addFood ? "Add" : "Update"}
        </button>
      </form>
    </div>
  );
  const updateItems = async (overwrite = false) => {
    getFoodFromMenu(restId ? restId : user.id, {
      limit: limit,
      skip: skip,
      sortBy: "price",
      sortValue,
      type: foodType ? foodType : undefined,
    })
      .then(({ data }) => {
        if (overwrite) return setItems(data);
        console.log("Duzina: " + items.length);
        if (items != null && items.length != 0) setItems(items.concat(data));
        else setItems(data);
        if (data.length < limit) setPlus(false);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    updateItems();
    getAvailableFoodTypes(restId)
      .then(({ data }) => {
        setAvailableTypes(data);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    updateItems();
  }, [skip, limit]);

  const addFood =
    addFlag && !idSel ? (
      <AddFoodForm onSubmitHandler={onSubmitAddFood} addFood={true} />
    ) : (
      <button
        class="blue large ui basic button"
        onClick={() => setAddFlag(true)}
      >
        <i class="glass martini icon"></i>
        Add food to the menu
      </button>
    );

  const updateFood = idSel ? (
    <AddFoodForm
      addFood={false}
      name={idSel.name}
      price={idSel.price}
      type={idSel.type}
      onSubmitHandler={onSubmitUpdateFood}
    />
  ) : (
    ""
  );
  const foodOptions = availableTypes.map((type, index) => ({
    key: index,
    text: type,
    value: index,
  }));

  const sortArr = ["ASC", "DESC"];
  const sortOptions = [
    { key: 0, text: "ASC", value: 0 },
    { key: 1, text: "DESC", value: 1 },
  ];
  // console.log(sortRef.current.value);
  return (
    <div className="pageWrapper">
      {role === "Restaurant" ? (
        addFood
      ) : (
        <div className="dropdown-container">
          <div className="drop ui label">Food Type</div>
          <Dropdown
            placeholder="none"
            onChange={(e, data) => {
              console.log(data.value);
              if (!availableTypes || !availableTypes.length) return;
              setFoodType(availableTypes[data.value]);
            }}
            search
            selection
            options={foodOptions}
          />
          <div className="drop ui label">Sort By Price</div>
          <Dropdown
            placeholder="ASC"
            onChange={(e, data) => {
              console.log(data.value);
              setSortValue(sortArr[data.value]);
            }}
            search
            selection
            options={sortOptions}
          />
          <div
            className="drop ui label"
            onClick={() => {
              updateItems(true);
            }}
          >
            Search
          </div>
        </div>
      )}
      {
        <List>
          {items.map((item) => (
            <List.Item key={item.id}>
              <Item
                overwriteHtml={
                  role == "Restaurant"
                    ? idSel && idSel.id == item.id
                      ? updateFood
                      : ""
                    : ""
                }
                onSelect={(id) => {
                  setIdSel(id);
                  getFood(id);
                }}
                button={{
                  icon,
                  onClick: onBtnClick,
                }}
                {...item}
              ></Item>
            </List.Item>
          ))}
        </List>
      }
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
  );
}
/* <FetchedList
				fetchItems={getFoodFromMenu.bind(null, restId ? restId : user.id)}
				itemSelected={() => {
					console.log('item selected!!');
				}}
				user={user}
				button={{ icon, onClick: onBtnClick }}
			/> */
export default RestaurantMenuPage;
