import {
  back_Homepage,
  go_signpage,
  post_article,
  CheckAuth_WithToken,
  showName,
  signout,
  userless,
  CreateArticleLine,
  setCookie,
  search,
  signin,
} from "./module.js";
back_Homepage();
go_signpage();
setCookie();
search();

const token = localStorage.getItem("token");
if (token) {
  const authResult = await CheckAuth_WithToken(token);
  post_article();
  signout("/");
  console.log("authResult:", authResult);
  if (authResult.user) {
    document.querySelector("#no-memberFunction").style = "display:none;";

    showName(authResult.user.name);
    //出現會員功能按鈕
    document.querySelector("#memberFunction").style = "display:block; height:150px";
    const myArticles = document.querySelector("#myArticles");
    const savedArticles = document.querySelector("#savedArticles");
    const commentArticles = document.querySelector("#commentArticles");
    const privateMsgLink = document.querySelector("#privateMsg");
    const memberPage = document.querySelector("#memberPage");

    myArticles.addEventListener("click", () => {
      location.href = "/member?source=myArticles";
    });
    commentArticles.addEventListener("click", () => {
      location.href = "/member?source=commentArticles";
    });
    savedArticles.addEventListener("click", () => {
      location.href = "/member?source=savedArticles";
    });

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
    memberPage.addEventListener("click", () => {
      location.href = "/member";
    });
  } //if(authResult.user)
} else {
  console.log("status:un-signin");
  signin();
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
//人氣文章-最新文章
const url = "/api/article/ranking";
const options = { method: "GET", "Content-Type": "application/json" };
try {
  const ranking = await fetchData(url, options);
  console.log("ranking:", ranking);
  const latestArticle = new CreateArticleLine("#latestArticle");
  ranking.result_latest.result.forEach((article) => {
    latestArticle.createLine(article);
  });
  document.querySelectorAll("#latestArticle .articleList-line").forEach((line, index) => {
    line.addEventListener("click", () => {
      location.href = `/articleView?article_id=${ranking.result_latest.result[index].id}`;
    });
  });

  const popularArticle = new CreateArticleLine("#popularArticle");
  ranking.result_popular.result.forEach((article) => {
    popularArticle.createLine(article);
  });
  document
    .querySelectorAll("#popularArticle .articleList-line")
    .forEach((line, index) => {
      line.addEventListener("click", () => {
        location.href = `/articleView?article_id=${ranking.result_popular.result[index].id}`;
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
