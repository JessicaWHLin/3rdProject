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

const token = localStorage.getItem("token");
if (token) {
  const authResult = await CheckAuth_WithToken(token);
  post_article();
  signout("/");
  console.log("authResult:", authResult);
  if (authResult.user) {
    showName(authResult.user.name);
    const privateMsgLink = document.querySelector("#privateMsg");
    privateMsgLink.addEventListener("click", async (e) => {
      const url = `/api/chat/roomId?member_id=${authResult.user.id}`;
      const options = { method: "GET", "Content-Type": "application/json" };
      const result = await fetchData(url, options);
      if (result.ok) {
        if (result.result.length < 1) {
          e.preventDefault();
          alert("目前無個人私訊");
        } else {
          const room_id = result.result[0].room_id;
          location.href = `/chat?roomId=${room_id}`;
        }
      }
    });
  } //if(authResult.user)
} else {
  console.log("status:un-signin");
  userless();
}

//-----------------------------------------------------------
const ZONES = [
  "東北亞",
  "東南亞",
  "台灣",
  "南亞",
  "亞西",
  "中國港澳",
  "歐洲",
  "紐澳大洋洲",
  "非洲",
];
const container = document.querySelector("#zoneList");
for (let i = 0; i < ZONES.length; i++) {
  let zone = document.createElement("div");
  zone.classList.add("link");
  zone.textContent = ZONES[i];
  zone.addEventListener("click", () => {
    location.href = `/articleList?zone=${ZONES[i]}`;
  });
  container.appendChild(zone);
}

// -------------------------------------
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
