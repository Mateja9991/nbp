import react, { useEffect, useRef, useState } from "react";
import "../../styles/Chat.css";
import Item from "../../components/Card/Item";
import Contact from "./Contact";
import { useSocket } from "../../context/socketProvider";
import { getUserByUsername, getUserById } from "../../API";
import { getCustomerContacts } from "../../API/Customers";
import { getCarrierContacts } from "../../API/Carriers";

function Contacts({ setSelected, role }) {
  const inputRef = useRef();
  const socket = useSocket();
  const [contacts, setContacts] = useState([]);
  var contactList;

  //pribavljanje Usera po id-u
  useEffect(() => {
    if (socket)
      socket.on("new-message", async (payload) => {
        const { senderId, msg } = JSON.parse(payload);
        if (contacts.filter((contact) => contact.id == senderId).length) {
          contacts.sort((a, b) => (a.id == senderId ? 1 : 0));
        } else {
          const { data: newContact } = await getUserById(senderId).catch(
            (err) => {
              console.log(err);
            }
          );
          if (newContact) setContacts([newContact, ...contacts]);
        }
      });
    return () => {
      if (socket) socket.off("new-message");
    };
  }, []);
  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      const { data: newContact } = await getUserByUsername(
        inputRef.current.value
      ).catch((err) => console.log(err));
      if (!newContact) return;
      setContacts([newContact, ...contacts]);
    }
  };

  var getContacts;
  if (role === "Customer") getContacts = getCustomerContacts;
  else getContacts = getCarrierContacts;

  const updateItems = async () => {
    getContacts()
      .then(({ data }) => {
        console.log("data: ");
        console.log(data);
        setContacts(data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    updateItems();
  }, []);

  if (contacts != null) {
    contactList = contacts.map((user) => {
      return (
        <Contact
          key={user.id}
          username={user.username}
          user={user}
          setSelected={setSelected}
        />
      );
    });
  } else contactList = "";

  return (
    <div className="contactsPage">
      <div className="contactsWrapper">{contactList}</div>
      <div className="addContact">
        <div class="ui input">
          <input
            type="text"
            placeholder="Enter contact username"
            ref={inputRef}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
}

export default Contacts;
