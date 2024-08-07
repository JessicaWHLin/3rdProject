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
  }
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
    location.href = "/articleList";
  });
  container.appendChild(zone);
}
