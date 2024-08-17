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

//取得roomId
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
    const isMemberInRoom = roomId.includes(authResult.user.id.toString());
    console.log("isMemberInRoom", isMemberInRoom);
    //左邊聊天室選項
    const url = `/api/chat/queryRoomId?member_id=${authResult.user.id}`;
    const options = { method: "GET", "Content-Type": "application/json" };
    const result_room = await fetchData(url, options);
    console.log(" result_room:", result_room.result);
    let chat_member_id = [];
    for (let i = 0; i < result_room.result.length; i++) {
      let temp = result_room.result[i].room_id.split("-");
      if (temp[0] == authResult.user.id) {
        chat_member_id.push(temp[1]);
      } else {
        chat_member_id.push(temp[0]);
      }
    }
    console.log("chat_member_id:", chat_member_id);

    if (chat_member_id.length > 0) {
      const url = `/api/chat/querySender?member_id=${chat_member_id}`;
      const options = { method: "GET", "Content-Type": "application/json" };
      const result_sender = await fetchData(url, options);
      console.log("result_sender:", result_sender);
    }

    if (isMemberInRoom === false) {
      alert("Oops...這不是你的私訊空間");
      location.href = "/";
    } else {
      const socket = io({
        path: "/chat/socket.io/",
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
      socket.on("history", (history) => {
        console.log(history);
        load_history_msg(history, authResult);
      });
      socket.off("history", (history) => {
        console.log(history);
        load_history_msg(history, authResult);
      });
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (input.value) {
          socket.emit("joinRoom", roomId);
          socket.emit("chat message", { msg: input.value, token: `Bearer ${token}` });
          input.value = "";
        }
      });

      socket.on("chat message", (msg) => {
        // console.log(msg);
        const subcontainer = document.createElement("div");
        const item = document.createElement("div");
        const datetime = document.createElement("span");
        datetime.style = "font-size:10px; color:rgb(170, 175, 194);";
        datetime.textContent = msg.localtime;
        if (msg.memberId == authResult.user.id) {
          subcontainer.style = "text-align:right;";
          item.textContent = msg.msg;
        } else {
          item.textContent = msg.name + " : " + msg.msg;
        }
        subcontainer.appendChild(item);
        subcontainer.appendChild(datetime);
        messages.appendChild(subcontainer);
        window.scrollTo(0, document.body.scrollHeight);
      });
    }
  }
} else {
  userless();
  console.log("status:un-signin");
}

//---------------------------------------------
function load_history_msg(history, authResult) {
  for (let i = 0; i < history.length; i++) {
    const localtime = new Date(history[i].created_at);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const subcontainer = document.createElement("div");
    const item = document.createElement("div");
    const datetime = document.createElement("span");
    datetime.style = "font-size:10px; color:rgb(170, 175, 194);";
    datetime.textContent = localtime.toLocaleString(undefined, {
      timeZone: userTimeZone,
      hour12: false,
    });
    if (history[i].member_id == authResult.user.id) {
      subcontainer.style = "text-align:right;";
      item.textContent = history[i].content;
    } else {
      item.textContent = history[i].name + " : " + history[i].content;
    }
    subcontainer.appendChild(item);
    subcontainer.appendChild(datetime);
    messages.appendChild(subcontainer);
    window.scrollTo(0, document.body.scrollHeight);
  }
}

async function fetchData(url, options) {
  let data = await fetch(url, options)
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      console.log("error:", error);
    });
  return data;
}
