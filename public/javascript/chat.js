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
const roomId = decodeURIComponent(path[1]);
const token = localStorage.getItem("token");
if (token) {
  const authResult = await CheckAuth_WithToken(token);
  post_article();
  signout("/");
  console.log("authResult:", authResult);
  if (authResult.user) {
    showName(authResult.user.name);

    //socket.io
    const socket = io("https://www.trippals.site/chat", {
      path: "/chat/socket.io",
      query: {
        room: roomId,
      },
      transports: ["websocket"],
    });

    const form = document.getElementById("form");
    const input = document.getElementById("input");
    const messages = document.getElementById("messages");
    const messageList = [];

    // 接收歷史訊息;
    socket.on("history", (historyList) => {
      console.log("historyList:", historyList);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (input.value) {
        socket.emit("joinRoom", roomId);
        socket.emit("chat message", { msg: input.value, token: `Bearer ${token}` });
        socket.emit("history", { roomId: roomId, messageList });
        input.value = "";
      }
    });

    socket.on("chat message", (msg) => {
      // console.log(msg);
      const item = document.createElement("li");
      if (msg.memberId == authResult.user.id) {
        item.style = "text-align:right; font-weight:700";
        item.textContent = msg.msg;
      } else {
        item.textContent = msg.name + " : " + msg.msg;
      }
      messages.appendChild(item);
      messageList.push(msg);

      window.scrollTo(0, document.body.scrollHeight);
    });
  }
} else {
  userless();
  console.log("status:un-signin");
}
