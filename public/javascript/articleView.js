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
  signout("/articleView");
  console.log("authResult:", authResult);
  if (authResult.user) {
    showName(authResult.user.name);
  }
} else {
  userless();
  console.log("status:un-signin");
}
//--------------------------------------
//取得article_id
const path = window.location.search.split("=");
const article_id = decodeURIComponent(path[1]);
console.log("article_id", article_id);
const url = `/api/article?article_id=${article_id}`;
const options = {
  method: "GET",
  "Content-Type": "application/json",
};
const result = await fetchData(url, options);
const articles = result.articles[0];

console.log(result);

document.querySelector("#zone").textContent = ">" + articles.zones;
document.querySelector("#class").textContent = articles.class;
document.querySelector("#title").textContent = articles.title;
document.querySelector("#likeQty").textContent = articles.likeQty;
document.querySelector("#commentQty").textContent = articles.commentQty;
document.querySelector("#username").textContent = articles.name;
document.querySelector("#content").textContent = articles.content;

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
