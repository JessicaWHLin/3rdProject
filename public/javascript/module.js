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

export async function signin() {
  const signinBtn = document.querySelector("#signinBtn");
  signinBtn.addEventListener("click", async () => {
    const signinData = { email: signinEmail.value, password: signinPassword.value };
    const urlSignin = "/api/auth/signin";
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signinData),
    };
    const result = await fetchData(urlSignin, options);
    console.log("signin-result:", result);
    if (result.ok == true) {
      localStorage.setItem("token", result.token);
      location.href = "/";
    } else {
      const showResult = document.querySelector(".signinResult");
      showResult.style = "color:red; font-weight:700";
      if (result.error == "invalid password") {
        showResult.textContent = "密碼錯誤";
      } else if (result.error == "invalid email") {
        showResult.textContent = "無此用戶信箱";
      } else {
        showResult.textContent = `${result.message}`;
      }
    }
  });
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
    const likeIcon = document.createElement("i");
    const commentIcon = document.createElement("i");
    const viewIcon = document.createElement("i");
    const commentQty = document.createElement("span");
    const createDate = document.createElement("span");
    const viewQty = document.createElement("span");

    title.classList.add("articleList-item");
    title.classList.add("link");
    title.classList.add("flag");
    title.style = "flex:4; overflow: hidden; text-overflow: ellipsis;";
    zone.classList.add("articleList-item");
    zone.style = " font-size:12px;line-height:20px";
    Class.classList.add("articleList-item");
    Class.style = " font-size:12px;line-height:20px";
    likeQty.classList.add("articleList-item");
    likeQty.classList.add("articleList-nolink");
    commentQty.classList.add("articleList-item");
    commentQty.classList.add("articleList-nolink");
    createDate.classList.add("articleList-item");
    createDate.classList.add("articleList-nolink");
    createDate.style = "width:max-content";
    likeIcon.classList.add("small_icon");
    likeIcon.classList.add("fa");
    likeIcon.classList.add("fa-thumbs-up");
    likeIcon.style = "color: rgb(88, 123, 176)";
    commentIcon.classList.add("fa");
    commentIcon.classList.add("fa-comments");
    commentIcon.classList.add("articleList-nolink");
    viewIcon.classList.add("fa");
    viewIcon.classList.add("fa-eye");
    viewIcon.classList.add("articleList-nolink");
    viewQty.classList.add("articleList-item");
    viewQty.classList.add("articleList-nolink");

    title.textContent = article.title;
    zone.textContent = ` ${article.zones}`;
    Class.textContent = ` ${article.class}`;
    likeQty.textContent = article.likeQty;
    commentQty.textContent = article.commentQty;
    viewQty.textContent = article.viewQty;
    createDate.textContent = article.created_at.split("T")[0];
    likeIcon.src = "image/flower_by_vecteezy.png";

    subcontainer.appendChild(title);
    subcontainer.appendChild(zone);
    subcontainer.appendChild(Class);
    subcontainer.appendChild(createDate);
    subcontainer.appendChild(likeIcon);
    subcontainer.appendChild(likeQty);
    subcontainer.appendChild(commentIcon);
    subcontainer.appendChild(commentQty);
    subcontainer.appendChild(viewIcon);
    subcontainer.appendChild(viewQty);
    this.container.appendChild(subcontainer);
  }
}

export function setCookie() {
  const today = new Date().toISOString().split("T")[0];
  const trackingId = today + "-" + Math.floor(Math.random() * 10000);
  if (!Cookies.get("trackingId")) {
    Cookies.set("trackingId", trackingId, { expires: 1 });
  }
}

export function search() {
  const searchbtn = document.querySelector(".searchbtn");
  searchbtn.addEventListener("click", () => {
    const keyword = document.querySelector("#search").value;
    location.href = `/articleList?keyword=${keyword}`;
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

//Email的regex
function checkEamilValidity(emailValue) {
  let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (emailPattern.test(emailValue)) {
    return true;
  } else {
    return false;
  }
}
