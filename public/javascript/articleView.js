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
//取得article_id
const path = window.location.search.split("=");
const article_id = decodeURIComponent(path[1]);
console.log("article_id", article_id);
class Image {
  constructor(container) {
    this.container = document.querySelector(container);
  }
  createImage(data) {
    for (let i = 0; i < data.length; i++) {
      const image = document.createElement("img");
      image.classList.add("articleWrite-uploadImg");
      image.src = data[i].imageURL;
      this.container.appendChild(image);
    }
  }
}
class Comment {
  constructor(container) {
    this.container = document.querySelector(container);
  }
  renderComment(data) {
    for (let i = 0; i < data.length; i++) {
      const subContainer = document.createElement("div");
      subContainer.classList.add("zone-setting");
      const name = document.createElement("div");
      name.classList.add("articleView-username");

      const created_at = document.createElement("div");
      created_at.style = "color: rgb(170, 175, 194); font-size:12px;";
      created_at.classList.add("response-comment");
      const separator = document.createElement("div");
      separator.classList.add("separator");
      separator.style = "margin:10px auto";
      const comment = document.createElement("div");
      comment.classList.add("response-comment");
      comment.style = "white-space: pre-wrap;";

      const likeQtyContainer = document.createElement("div");
      likeQtyContainer.classList.add("response-comment");
      const likeQty = document.createElement("span");
      likeQty.style = "vertical-align: top; color: rgb(170, 175, 194);";
      const flowerIcon = document.createElement("img");
      flowerIcon.classList.add("small_icon");
      likeQtyContainer.appendChild(flowerIcon);
      likeQtyContainer.appendChild(likeQty);

      comment.textContent = data[i].content;
      name.textContent = data[i].name;
      likeQty.textContent = data[i].likeQty;
      created_at.textContent = data[i].created_at.split("T")[0];
      flowerIcon.src = "image/flower_by_vecteezy.jpg";
      subContainer.appendChild(name);
      subContainer.appendChild(created_at);
      subContainer.appendChild(separator);
      subContainer.appendChild(comment);
      subContainer.appendChild(likeQtyContainer);
      this.container.appendChild(subContainer);
    }
  }
}
const commentBtn = document.querySelector(".response-btn");
const flower = document.querySelector("#like");
const token = localStorage.getItem("token");
//--------------------------------------
//文章
const url = `/api/article?article_id=${article_id}`;
const options = {
  method: "GET",
  "Content-Type": "application/json",
};
const result = await fetchData(url, options);
console.log("文章細節:", result);
const articles = result.content.articles[0];
const imageURL = result.images.images;

document.title = articles.title;
document.querySelector("#zone").textContent = ">" + articles.zones;
document.querySelector("#class").textContent = articles.class;
document.querySelector("#title").textContent = articles.title;
document.querySelector("#article_like").textContent = articles.likeQty;
document.querySelector("#commentQty").textContent = articles.commentQty;
document.querySelector("#created_at").textContent = articles.created_at.split("T")[0];
document.querySelector("#username").textContent = articles.name;
document.querySelector("#content").textContent = articles.content;
//圖片
const imageContainer = new Image("#articleView-imageContainer");
imageContainer.createImage(imageURL);
//留言
const oldComments = await fetchData(`/api/article/comment?article_id=${article_id}`, {
  method: "GET",
});
console.log("oldComment:", oldComments);
const comments = oldComments.result.result;
const createComment = new Comment("#comment-container");
createComment.renderComment(comments);

//未登入想留言
const name = document.querySelector(".showName");
commentBtn.addEventListener("click", (e) => {
  if (name.textContent == "") {
    e.preventDefault();
    alert("請先登入");
  }
});
//未登入想按讚
flower.addEventListener("click", (e) => {
  if (name.textContent == "") {
    e.preventDefault();
    alert("請先登入");
  }
});

if (token) {
  const authResult = await CheckAuth_WithToken(token);
  post_article();
  signout(`/articleView?article_id=${article_id}`);
  console.log("authResult:", authResult);
  if (authResult.user) {
    showName(authResult.user.name);
  }
  //留言
  commentBtn.addEventListener("click", async () => {
    let comment = document.querySelector("#comment");
    console.log("comment:", comment.value);

    const url = "/api/article/comment";
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: comment.value, article_id: article_id }),
    };
    const result = await fetchData(url, options);
    if (result.result.ok === true) {
      comment.value = "";
      const comments = result.result.result;
      console.log("latest comment:", comments);
      const createComment = new Comment("#comment-container");
      createComment.renderComment(comments);
    } else {
      console.log("留言return異常:", result);
    }
  });
  //按讚
  flower.addEventListener("click", async () => {
    console.log("按讚");
    const url = "/api/article/like";
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        article_id: article_id,
        comment_id: null,
      }),
    };
    const result = await fetchData(url, options);
    console.log("article_like result:", result);
    let likeQty = parseInt(document.querySelector("#article_like").textContent);

    if (result.ok === true) {
      document.querySelector("#article_like").textContent = likeQty + 1;
    } else if (result.ok === false) {
      document.querySelector("#article_like").textContent = likeQty - 1;
    } else {
      console.log("error:", result.message);
    }
  });
} else {
  userless();
  console.log("status:un-signin");
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
