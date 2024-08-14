import {
  back_Homepage,
  go_signpage,
  post_article,
  CheckAuth_WithToken,
  showName,
  signout,
  userless,
} from "./module.js";
back_Homepage();
go_signpage();
//取得friend_id
const path = window.location.search.split("=");
const friend_id = decodeURIComponent(path[1]);
const token = localStorage.getItem("token");
console.log("friend_id", friend_id);
if (token) {
  const authResult = await CheckAuth_WithToken(token);
  post_article();
  signout("/");
  console.log("authResult:", authResult);
  if (authResult.user) {
    showName(authResult.user.name);
    //socket.io
    const socket = io();
    const form = document.getElementById("form");
    const input = document.getElementById("input");
    const messages = document.getElementById("messages");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (input.value) {
        socket.emit("chat message", input.value);
        input.value = "";
      }
    });

    socket.on("chat message", (msg) => {
      const item = document.createElement("li");
      item.textContent = `${authResult.user.name}` + " : " + msg;
      messages.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
    });
  }
} else {
  userless();
  console.log("status:un-signin");
}
