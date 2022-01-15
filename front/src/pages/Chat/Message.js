import React from "react";
import '../../styles/Chat.css';

const Message = (props) => {
  const findWidth = () => {
    const w = props.text.length * 17;
    if (w > 180) {
      return 180;
    } else {
      return w;
    }
  };

  const w = findWidth() + "px";
  const time = new Date(props.time);

  if (props.dirFlag === true) {
    return (
      <div className="messageWrap">
        <div className="messageChat messageO" style={{}}>
          {props.text}
        </div>
      </div>
    );
  } else {
    return (
      <div className="messageWrap2">
        <div className="messageChat messageD" style={{}}>
          {props.text}
        </div>
      </div>
    );
  }
};

export default Message;