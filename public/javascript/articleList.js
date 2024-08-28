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
} from "./module.js";
back_Homepage();
go_signpage();
setCookie();
search();
const token = localStorage.getItem("token");

//----------------------------------
//取得zone or keyword
const path = window.location.search.split("=");
const titleName = document.querySelector("#zoneName");
let url;
console.log("path:", path);
console.log(path[0].includes("keyword"));
if (path[0].includes("zone")) {
  const zone = decodeURIComponent(path[1]);
  titleName.textContent = zone;
  url = `/api/article/articleList?zone=${zone}`;
} else if (path[0].includes("keyword")) {
  const keyword = decodeURIComponent(path[1]);
  titleName.textContent = keyword;
  url = `/api/article/articleList?keyword=${keyword}`;
}

const options = {
  method: "GET",
  headers: { "Content-Type": "application/json" },
};
const result = await fetchData(url, options);
const articles = result.result;
if (articles.length > 0) {
  const zoneList = new CreateArticleLine("#zoneList");
  articles.forEach((article) => {
    zoneList.createLine(article);
  });
  document.querySelectorAll(".link").forEach((link, index) => {
    link.addEventListener("click", () => {
      location.href = `/articleView?article_id=${articles[index].id}`;
    });
  });
}

if (token) {
  const authResult = await CheckAuth_WithToken(token);
  post_article();
  const path_now = window.location.search.split("?");
  signout(`/articleList?${path_now[1]}`);
  console.log("authResult:", authResult);
  if (authResult.user) {
    showName(authResult.user.name);
  }
} else {
  console.log("status:un-signin");
  userless();
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
