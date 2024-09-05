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
//取得zone or keyword or popular/latest
const path = window.location.search.split("=");
const titleName = document.querySelector("#zoneName");
let url;
let page = 0;
const loadMore = document.createElement("button");
loadMore.classList.add("btn");
loadMore.style = "position:absolute;bottom:20px; left:calc(50% - 63px);";
loadMore.textContent = "載入更多文章";

if (path[0].includes("zone")) {
  const zone = decodeURIComponent(path[1]);
  titleName.textContent = zone;
  url = `/api/article/articleList?zone=${zone}&page=${page}`;
  page = await articleLine(url);
  url = updateUrl(zone, page);
  loadingmore(zone);
} else if (path[0].includes("keyword")) {
  const keyword = decodeURIComponent(path[1]);
  titleName.textContent = keyword;
  url = `/api/article/articleList?keyword=${keyword}&page=${page}`;
  page = await articleLine(url);
  url = updateUrl(keyword, page);
  loadingmore(keyword);
} else if (path[0].includes("item")) {
  const item = decodeURIComponent(path[1]);
  if (item == "popularAll") {
    titleName.textContent = "人氣瀏覽文章";
  }
  if (item == "latestAll") {
    titleName.textContent = "最新發佈文章";
  }
  url = `/api/article/articleList?item=${item}&page=${page}`;
  page = await articleLine(url);
  url = updateUrl(item, page);
  loadingmore(item);
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

async function articleLine(url) {
  const options = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };
  const result = await fetchData(url, options);
  const articles = result.result;
  const nextPage = result.nextPage;
  console.log("nextPage:", nextPage);
  console.log(articles);
  if (articles.length > 0) {
    const zoneList = new CreateArticleLine("#zoneList");
    articles.forEach((article) => {
      zoneList.createLine(article);
    });
    document.querySelectorAll(".link.flag").forEach((link, index) => {
      link.addEventListener("click", () => {
        location.href = `/articleView?article_id=${articles[index].id}`;
      });
      link.classList.remove("flag");
    });
  }
  return nextPage;
}

function updateUrl(item, page) {
  return `/api/article/articleList?item=${item}&page=${page}`;
}
function loadingmore(item) {
  if (page) {
    document.querySelector("#zoneList").appendChild(loadMore);
    //load more
    loadMore.addEventListener("click", async () => {
      page = await articleLine(url);
      url = updateUrl(item, page);
      if (page) {
      } else {
        loadMore.style = "display:none";
      }
    });
  }
}
