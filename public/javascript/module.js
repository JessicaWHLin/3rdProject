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
    const url = "/user";
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
    subcontainer.classList.add("link");
    const title = document.createElement("span");
    title.textContent = article.title;
    const Class = document.createElement("span");
    Class.textContent = ` 【${article.class}】`;
    const LikeQty = document.createElement("span");
    LikeQty.textContent = article.LikeQty;
    const commentQty = document.createElement("span");
    commentQty.textContent = article.commentQty;
    const createDate = document.createElement("span");
    createDate.textContent = article.created_at.split("T")[0];
    subcontainer.appendChild(Class);
    subcontainer.appendChild(title);
    subcontainer.appendChild(createDate);
    subcontainer.appendChild(LikeQty);
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
