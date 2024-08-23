import {
  back_Homepage,
  go_signpage,
  post_article,
  CheckAuth_WithToken,
  showName,
  signout,
  userless,
  CreateArticleLine,
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
    //出現會員功能按鈕
    document.querySelector("#memberPage").style = "display:block";
    document.querySelector("#myArticles").style = "display:block";
    document.querySelector("#mySavedArticles").style = "display:block";
    document.querySelector("#myCommentArticles").style = "display:block";
    document.querySelector("#privateMsg").style = "display:block";

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
    document.querySelector("#memberPage").addEventListener("click", () => {
      location.href = "/member";
    });
  } //if(authResult.user)
} else {
  console.log("status:un-signin");
  userless();
}

//-----------------------------------------------------------
//未登入也看的到
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

const url = "api/article/ranking";
const options = { method: "GET", "Content-Type": "application/json" };
try {
  const ranking = await fetchData(url, options);
  console.log(ranking);
  const latestArticle = new CreateArticleLine("#latestArticle");
  ranking.result_latest.result.forEach((article) => {
    latestArticle.createLine(article);
  });
  document.querySelectorAll("#latestArticle .articleList-line").forEach((line, index) => {
    line.addEventListener("click", () => {
      location.href = `/articleView?article_id=${ranking.result_latest.result[index].id}`;
    });
  });
} catch (error) {
  console.log("後端未傳資料");
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
