export function back_Homepage() {
  const homeIcon = document.querySelector("#home");
  homeIcon.addEventListener("click", () => {
    const url = "/";
    fetch(url)
      .then((response) => response)
      .then((data) => {
        location.href = url;
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  });
}
export function go_signpage() {
  const signpage = document.querySelector("#signpage");
  signpage.addEventListener("click", () => {
    const url = "/sign";
    fetch(url)
      .then((response) => response)
      .then((data) => {
        location.href = url;
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  });
}

export function post_article() {
  const articlepage = document.querySelector("#articlepage");
  articlepage.addEventListener("click", () => {
    const url = "/articleWrite";
    fetch(url)
      .then((response) => response)
      .then((data) => {
        location.href = url;
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  });
}

export async function CheckAuth_WithToken(token) {
  const url = "/api/auth/auth";
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const result = await fetchData(url, options);
  // console.log("check_auth:", result);
  return result;
}

export function showName(username) {
  const showName = document.querySelector(".showName");
  const signPageBtn = document.querySelector("#signpage");
  const signoutBtn = document.querySelector("#signoutBtn");
  console.log("signin success!");
  signPageBtn.style.display = "none";
  signoutBtn.style.display = "inline-block";
  showName.style.display = "inline-block";
  showName.classList.add("zone-title");
  showName.textContent = `歡迎光臨 ${username}`;
}

export function signout(url) {
  const signoutBtn = document.querySelector("#signoutBtn");
  const showName = document.querySelector(".showName");
  const signPageBtn = document.querySelector("#signpage");
  signoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    signPageBtn.style.display = "inline-block";
    signoutBtn.style.display = "none";
    showName.style.display = "none";
    console.log("status:signout");
    fetch(url)
      .then((response) => response)
      .then(() => {
        location.href = url;
      })
      .catch((error) => {
        console.log({ error: error });
      });
  });
}

export function userless() {
  const articlepage = document.querySelector("#articlepage");
  articlepage.addEventListener("click", (event) => {
    event.preventDefault();
    alert("請先登入會員");
  });
}

//文章條格式
export class CreateArticleLine {
  constructor(container) {
    this.container = document.querySelector(container);
  }
  createLine(article) {
    const subcontainer = document.createElement("div");
    subcontainer.classList.add("articleList-line");

    const title = document.createElement("span");
    const zone = document.createElement("span");
    const Class = document.createElement("span");
    const likeQty = document.createElement("span");
    const flowerIcon = document.createElement("img");
    const commentIcon = document.createElement("img");
    const commentQty = document.createElement("span");
    const createDate = document.createElement("span");

    title.classList.add("articleList-item");
    title.classList.add("link");
    title.style = "flex:4; overflow: hidden; text-overflow: ellipsis;";
    zone.classList.add("articleList-item");
    zone.style = "flex:1 min-width:80px";
    Class.classList.add("articleList-item");
    Class.style = "flex:1 min-width:80px";
    likeQty.classList.add("articleList-item");
    likeQty.classList.add("articleList-nolink");
    commentQty.classList.add("articleList-item");
    commentQty.classList.add("articleList-nolink");
    createDate.classList.add("articleList-item");
    createDate.classList.add("articleList-nolink");
    flowerIcon.classList.add("small_icon");
    commentIcon.classList.add("small_icon");

    title.textContent = article.title;
    zone.textContent = ` 【${article.zones}】`;
    Class.textContent = ` 【${article.class}】`;
    likeQty.textContent = article.likeQty;
    commentQty.textContent = article.commentQty;
    createDate.textContent = article.created_at.split("T")[0];
    flowerIcon.src = "image/flower_by_vecteezy.png";
    commentIcon.src = "image/full_message_by_vecteezy.jpg";

    subcontainer.appendChild(zone);
    subcontainer.appendChild(Class);
    subcontainer.appendChild(title);
    subcontainer.appendChild(createDate);
    subcontainer.appendChild(flowerIcon);
    subcontainer.appendChild(likeQty);
    subcontainer.appendChild(commentIcon);
    subcontainer.appendChild(commentQty);
    this.container.appendChild(subcontainer);
  }
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

//Email的regex
function checkEamilValidity(emailValue) {
  let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (emailPattern.test(emailValue)) {
    return true;
  } else {
    return false;
  }
}
