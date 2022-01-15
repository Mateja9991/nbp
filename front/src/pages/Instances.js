import React, { useState, useContext, useEffect } from "react";
import { ListOfItems, FetchedList } from "../components/List";
import {
  getRestaurantInstances,
  registerInstance,
  deleteInstanceById,
} from "../API/Restaurants";
import "../styles/navBar.css";
import { useSocket } from "../context/socketProvider";

function InstancesPage({ user: { role, ...user }, setInstance }) {
  const socket = useSocket();
  const [items, setItems] = useState([]);
  const [addFlag, setAddFlag] = useState(false);
  const [skip, setSkip] = useState(0);
  const [plus, setPlus] = useState(true);
  const limit = 2;
  const deleteBtnClicked = async (instanceId) => {
    const { data } = await deleteInstanceById(instanceId);
    setItems(data);
  };

  useEffect(() => {
    getRestaurantInstances({ limit, skip })
      .then((response) => {
        return response.data;
      })
      .then((data) => {
        if (items)
          setItems([
            ...items,
            ...data.map((el, ind) => {
              el.name = el.username;
              return el;
            }),
          ]);
        else setItems(data.map((el, ind) => (el.name = ind.toString()) && el));
      })
      .catch((err) => console.log(err));
  }, [skip]);

  const onSubmitRegisterInstance = async (event) => {
    event.preventDefault();
    const {
      target: { username, password, address, city },
    } = event;
    if (
      username.value == "" ||
      password.value == "" ||
      address.value == "" ||
      city.value == ""
    )
      alert("Morate popuniti sva polja.");
    else {
      const instance = {
        username: username.value,
        password: password.value,
        address: address.value,
        city: city.value,
      };
      setAddFlag(false);
      const { data } = await registerInstance(instance);
      setItems(data);
    }
  };

  const AddInstanceForm = () => (
    <div className="formWrapper">
      <form
        id="test"
        class="ui form"
        method="POST"
        onSubmit={onSubmitRegisterInstance}
      >
        <div id="form-segment" class="ui center aligned attached segment">
          <div class="field">
            <div class="xWrapper">
              <i class="large x icon" onClick={() => setAddFlag(false)}></i>
            </div>
            <label for="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter instance username..."
            />
          </div>
          <div class="field">
            <label for="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
            />
          </div>
          <div class="field">
            <label for="address">Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Enter address..."
            />
          </div>
          <div class="field">
            <label for="city">City:</label>
            <input
              type="text"
              id="city"
              name="city"
              placeholder="Enter city..."
            />
          </div>
        </div>
        <button class="ui bottom attached fluid button" type="submit">
          Add
        </button>
      </form>
    </div>
  );
  return (
    <div class="pageWrapper">
      {addFlag ? (
        <AddInstanceForm />
      ) : (
        <button
          class="blue large ui basic button"
          onClick={() => setAddFlag(true)}
        >
          <i class="icon building"></i>
          Add new instance
        </button>
      )}
      <ListOfItems
        button={{ icon: "big delete icon", onClick: deleteBtnClicked }}
        itemSelected={() => {
          console.log("item selected.");
        }}
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
  );
}

export default InstancesPage;
