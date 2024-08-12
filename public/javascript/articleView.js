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
      const comment = document.createElement("span");
      const name = document.createElement("span");
      const likeQty = document.createElement("span");
      const created_at = document.createElement("span");
      comment.classList.add("text");
      comment.textContent = data[i].content;
      name.textContent = data[i].name;
      likeQty.textContent = data[i].likeQty;
      created_at.textContent = data[i].created_at;
      subContainer.appendChild(name);
      subContainer.appendChild(comment);
      subContainer.appendChild(likeQty);
      subContainer.appendChild(created_at);
      this.container.appendChild(subContainer);
    }
  }
}

const token = localStorage.getItem("token");
if (token) {
  const authResult = await CheckAuth_WithToken(token);
  post_article();
  signout("/articleView");
  console.log("authResult:", authResult);
  if (authResult.user) {
    showName(authResult.user.name);
  }
  //留言
  const commentBtn = document.querySelector(".response-btn");
  commentBtn.addEventListener("click", async (e) => {
    let comment = document.querySelector("#comment");
    console.log("comment:", comment.value);
    if (!authResult.user) {
      e.preventDefault();
      alert("請先登入");
    }

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
    if (result.ok) {
      document.querySelector("#comment").value = "";
      const oldComments = await fetchData(
        `/api/article/comment?article_id=${article_id}`,
        { method: "GET" }
      );
      const latest = oldComments.result.result.length - 1;
      const comments = oldComments.result.result[latest];
      console.log("latest comment:", comments);
      const createComment = new Comment("#comment-container");
      createComment.renderComment(comments);
    }
  });
} else {
  userless();
  console.log("status:un-signin");
}

//--------------------------------------
//文章
const url = `/api/article?article_id=${article_id}`;
const options = {
  method: "GET",
  "Content-Type": "application/json",
};
const result = await fetchData(url, options);
console.log(result);
const articles = result.content.articles[0];
const imageURL = result.images.images;

document.title = articles.title;
document.querySelector("#zone").textContent = ">" + articles.zones;
document.querySelector("#class").textContent = articles.class;
document.querySelector("#title").textContent = articles.title;
document.querySelector("#likeQty").textContent = articles.likeQty;
document.querySelector("#commentQty").textContent = articles.commentQty;
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
