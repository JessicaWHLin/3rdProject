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
// const path = window.location.search.split("=");
let roomId = Cookies.get("room_id");
console.log("一開始roomId:", roomId);
const token = localStorage.getItem("token");
if (token) {
  const authResult = await CheckAuth_WithToken(token);
  post_article();
  signout("/");
  console.log("authResult:", authResult);
  if (authResult.user) {
    showName(authResult.user.name);

    const isMemberInRoom = roomId.includes(authResult.user.id.toString());
    console.log("isMemberInRoom", isMemberInRoom);
    const messages = document.getElementById("messages");
    //左邊聊天室選項
    const url = `/api/chat/roomId?member_id=${authResult.user.id}`;
    const options = { method: "GET", "Content-Type": "application/json" };
    const roomIds = await fetchData(url, options);

    let chat_member_id = [];
    for (let i = 0; i < roomIds.result.length; i++) {
      let temp = roomIds.result[i].room_id.split("-");
      if (temp[0] == authResult.user.id) {
        chat_member_id.push(temp[1]);
      } else {
        chat_member_id.push(temp[0]);
      }
    }
    class SendersList {
      constructor(container) {
        this.container = document.querySelector(container);
      }
      listSenders(socket, nameLists, roomIds) {
        const rooms = roomIds.result;
        for (let i = 0; i < rooms.length; i++) {
          for (let j = 0; j < nameLists.length; j++) {
            if (rooms[i].room_id.includes(nameLists[j].id.toString())) {
              Object.assign(nameLists[j], { room_id: rooms[i].room_id });
            }
          }
        }
        console.log("nameLists:", nameLists);
        nameLists.forEach((item) => {
          const list = document.createElement("div");
          list.classList.add("chat-leftLink");
          list.classList.add("link");
          list.textContent = item.name;
          if (item.room_id == roomId) {
            console.log("item:", item, "roomId:", roomId);
            list.style = "color:green;font-weight:700;";
          }

          list.addEventListener("click", () => {
            socket.emit("leaveRoom", roomId);
            Cookies.set("room_id", item.room_id);
            roomId = item.room_id;
            socket.emit("joinRoom", roomId);
            while (messages.firstChild) {
              messages.removeChild(messages.firstChild);
            }
            const allLists = document.querySelectorAll(".link");
            allLists.forEach((list) => {
              list.style = "color:black;font-weight:500;";
            });
            list.style = "color:green;font-weight:700;";
          });
          this.container.appendChild(list);
        });
      }
    }

    //socket.io
    //避免非room_id上的member_id會員進入該私訊空間

    if (isMemberInRoom === false) {
      alert("Oops...這不是你的私訊空間");
      location.href = "/";
    } else {
      let socket = io({
        path: "/chat/socket.io/",
        transports: ["websocket"],
      });

      //找所有的私訊sender
      if (chat_member_id.length > 0) {
        const url = `/api/chat/sender?member_ids=${chat_member_id}`;
        const options = { method: "GET", "Content-Type": "application/json" };
        const senders = await fetchData(url, options);
        const senderNameList = senders.result.result;
        const roomContainer = new SendersList("#roomContainer");
        roomContainer.listSenders(socket, senderNameList, roomIds);
      }
      socket.emit("joinRoom", roomId);
      msg(socket, authResult, token, roomId); //及時私訊
      loadingHistoryMsg(socket, authResult); //接收歷史訊息

      console.log("test");
    }
  }
} else {
  userless();
  console.log("status:un-signin");
  alert("Oops...這不是你的私訊空間");
  location.href = "/";
}

//---------------------------------------------
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

function loadingHistoryMsg(socket, authResult) {
  socket.on("history", (history) => {
    load_history_msg(history, authResult);
  });
  socket.off("history", (history) => {
    load_history_msg(history, authResult);
  });
}

function msg(socket, authResult, token, roomId) {
  const form = document.getElementById("form");
  const input = document.getElementById("input");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit("chat message", { msg: input.value, token: `Bearer ${token}` });
      input.value = "";
    }
  });
  socket.on("chat message", (msg) => {
    const subcontainer = document.createElement("div");
    const item = document.createElement("div");
    const datetime = document.createElement("span");
    datetime.style = "font-size:10px; color:rgb(170, 175, 194);";
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isotime = new Date(msg.localtime);
    const localtime = isotime.toLocaleString(undefined, {
      timeZone: userTimeZone,
      hour12: false,
    });
    datetime.textContent = localtime;
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

function load_history_msg(history, authResult) {
  for (let i = 0; i < history.length; i++) {
    const localtime = new Date(history[i].created_at);
    // console.log("localtime:", localtime, "傳入:", history[i].created_at);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const subcontainer = document.createElement("div");
    const item = document.createElement("div");
    const datetime = document.createElement("span");
    datetime.style = "font-size:10px; color:rgb(170, 175, 194);";
    datetime.textContent = localtime.toLocaleString("zh-TW", {
      timeZone: userTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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
