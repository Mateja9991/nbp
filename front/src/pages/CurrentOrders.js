import React, { useState, useContext, useEffect } from "react";
import { FetchedList, ListOfItems } from "../components/List";
import { getInstanceCurrentOrders, markAsMade } from "../API";
import { useSocket } from "../context/socketProvider";

function CurrentOrdersPage({ role, user, itemSelected }) {
  const socket = useSocket();
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [plus, setPlus] = useState(true);
  const limit = 2;

  const button = {
    icon: "big check icon",
    onClick: (id) => {
      socket.emit("orderReady", id);
      markAsMade(id)
        .then(({ data }) => {
          setTimeout(() => {
            console.log("skip SET!!");
            setItems([]);
            setSkip(0);
          }, 500);
        })
        .catch((err) => {
          console.log(err);
        });
    },
  };

  const updateItems = async () => {
    getInstanceCurrentOrders({ limit, skip })
      .then(({ data }) => {
        if (items)
          setItems([
            ...items,
            ...data.map((item) => {
              item.name = `Order ${item.id}`;
              return item;
            }),
          ]);
        else
          setItems(
            data.map((item) => {
              item.name = `Order ${item.id}`;
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
  if (items != null && items.length != 0) {
    welcomeText = "Take a look at the orders you're currently working on";
  } else welcomeText = "There are no current orders";

  return (
    <>
      <div className="welcomeText">{welcomeText}</div>
      <ListOfItems button={button} itemSelected={itemSelected}>
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

export default CurrentOrdersPage;
