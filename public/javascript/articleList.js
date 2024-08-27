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
} from "./module.js";
back_Homepage();
go_signpage();
setCookie();
const token = localStorage.getItem("token");

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

if (result.result.length > 0) {
  const zoneList = new CreateArticleLine("#zoneList");
  result.result.forEach((article) => {
    zoneList.createLine(article);
  });
  document.querySelectorAll(".link").forEach((link, index) => {
    link.addEventListener("click", () => {
      location.href = `/articleView?article_id=${result.result[index].id}`;
    });
  });
}

if (token) {
  const authResult = await CheckAuth_WithToken(token);
  post_article();
  signout(`/articleList?zone=${zone}`);
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
