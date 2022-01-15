import react, { useState, useEffect } from "react";
import MessageBox from "./MessageBox";
import Contacts from "./Contacts";
import { useSocket } from "../../context/socketProvider";
import "../../styles/Chat.css";

function Chat({ user, role }) {
  const socket = useSocket();
  const [selected, setSelected] = useState();
  // useEffect(() => {}, []);
  return (
    <div className="chatWrapper">
      <MessageBox selected={selected} />
      <Contacts setSelected={setSelected} user={user} role={role} />
    </div>
  );
}

export default Chat;
