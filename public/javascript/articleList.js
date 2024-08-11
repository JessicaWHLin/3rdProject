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
  signout("/articleList");
  console.log("authResult:", authResult);
  if (authResult.user) {
    showName(authResult.user.name);
  }
} else {
  console.log("status:un-signin");
  userless();
}
//----------------------------------
//取得zone
const path = window.location.search.split("=");
const zone = decodeURIComponent(path[1]);
const zoneName = document.querySelector("#zoneName");
zoneName.textContent = zone;

const url = `/api/article/zoneList?zone=${zone}`;
const options = {
  method: "GET",
  "Content-Type": "application/json",
};
const result = await fetchData(url, options);
console.log({ result });

if (result.articles.length > 0) {
  const zoneList = new CreateArticleLine("#zoneList");
  result.articles.forEach((article) => {
    zoneList.createLine(article);
    console.log("articleID:", article.id);
    document.querySelector(".link").addEventListener("click", () => {
      location.href = `/articleView?article_id=${article.id}`;
    });
  });
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
