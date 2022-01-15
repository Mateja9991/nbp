import react, { useState, useEffect } from "react";

function Contact({
  id,
  username,
  user,
  imgSrc = "https://i.redd.it/d3n9acugx3g41.jpg",
  setSelected,
}) {
  return (
    <div
      onClick={() => {
        setSelected(user);
      }}
    >
      <div class="contact">
        <a class="ui tiny image">
          <img src={imgSrc} />
        </a>
        <div class="contactContent">
          <div class="header">{username}</div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
