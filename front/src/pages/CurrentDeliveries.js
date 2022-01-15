import React, { useState, useContext, useEffect } from "react";
import { FetchedList, ListOfItems } from "../components/List";
import { getCarrierCurrentDeliveries, markAsDelivered } from "../API";
import { useSocket } from "../context/socketProvider";

function CurrentDeliveriesPage({ role, user, orderSelected }) {
  const socket = useSocket();
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [plus, setPlus] = useState(true);
  const limit = 2;
  const button = {
    icon: "big delete icon",
    onClick: async (id) => {
      await markAsDelivered(id);
      setItems([]);
      setSkip(0);
    },
  };

  const updateItems = async () => {
    getCarrierCurrentDeliveries({ limit, skip })
      .then(({ data }) => {
        if (items)
          setItems([
            ...items,
            ...data.map((item) => {
              item.name = `Delivery ${item.id}`;
              return item;
            }),
          ]);
        else
          setItems(
            data.map((item) => {
              item.name = `Delivery ${item.id}`;
              return item;
            })
          );
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    updateItems();
  }, [skip]);

  var welcomeText;
  if (items != null && items.length != 0)
    welcomeText = "Take a look at the current deliveries";
  else welcomeText = "There are no current deliveries";

  return (
    <>
      <div className="welcomeText">{welcomeText}</div>
      <ListOfItems button={button} itemSelected={orderSelected}>
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
    </>
  );
}

export default CurrentDeliveriesPage;
