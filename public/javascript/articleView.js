import {
  back_Homepage,
  go_signpage,
  post_article,
  CheckAuth_WithToken,
  showName,
  signout,
  userless,
  setCookie,
  search,
} from "./module.js";
back_Homepage();
go_signpage();
setCookie();
search();
//取得article_id
const path = window.location.search.split("=");
const article_id = decodeURIComponent(path[1]);
console.log("article_id:", article_id);
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
  renderComment(data, mode) {
    for (let i = 0; i < data.length; i++) {
      const subContainer = document.createElement("div");
      subContainer.classList.add("zone-setting");
      subContainer.style = "padding:10px 0px;";
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

      comment.textContent = data[i].content;
      name.textContent = data[i].name;

      created_at.textContent = data[i].created_at.split("T")[0];
      subContainer.appendChild(name);
      subContainer.appendChild(created_at);
      subContainer.appendChild(separator);
      subContainer.appendChild(comment);
      this.container.appendChild(subContainer);

      if (mode === "new") {
        subContainer.classList.add("new-message");
        setTimeout(() => {
          subContainer.classList.add("visible");
        }, 10);
        subContainer.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          subContainer.classList.add("finished");
        }, 2000);
      }
    }
  }
}
const commentBtn = document.querySelector(".response-btn");
const thumbup = document.querySelector("#like");
const token = localStorage.getItem("token");
const saveClick = document.querySelector("#saveClick");

//文章
const url = `/api/article?article_id=${article_id}`;
const options = { method: "GET", "Content-Type": "application/json" };
const result = await fetchData(url, options);
console.log("文章細節:", result);
const articles = result.content.articles[0];
const imageURL = result.images.images;
const writer_id = articles.member_id;
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
const comments = oldComments.result.result;
const createComment = new Comment("#comment-container");
createComment.renderComment(comments, "old");

//未登入想留言
const name = document.querySelector(".showName");
commentBtn.addEventListener("click", (e) => {
  if (name.textContent == "") {
    e.preventDefault();
    alert("請先登入");
  }
});
//未登入想按讚
thumbup.addEventListener("click", (e) => {
  if (name.textContent == "") {
    e.preventDefault();
    alert("請先登入");
  }
});
//views-紀錄trackingId
const tracking_id = Cookies.get("trackingId");
console.log("tracking_id:", tracking_id);
const url_viewCount = "/api/article/views";
const options_viewCount = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ tracking_id: tracking_id, article_id: article_id }),
};
await fetchData(url_viewCount, options_viewCount);
//views-統計-render
const url_viewQty = `/api/article/views?article_id=${article_id}`;
const options_viewQty = {
  method: "GET",
  headers: { "Content-Type": "application/json" },
};
const result_viewQty = await fetchData(url_viewQty, options_viewQty);
console.log("result_viewQty=", result_viewQty);
if (result_viewQty) {
  document.querySelector("#viewQty").textContent = result_viewQty.viewQty;
}

if (token) {
  const authResult = await CheckAuth_WithToken(token);
  post_article();
  signout(`/articleView?article_id=${article_id}`);
  console.log("authResult:", authResult);
  if (authResult.user) {
    showName(authResult.user.name);

    //判斷有無收藏或按讚文章
    saveClick.style = "display: inline-block";
    const url = `api/article/favorite?article_id=${article_id}`;
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "applcation/json" },
    };
    const favorite = await fetchData(url, options);
    if (favorite.saved.ok === true) {
      document.querySelector("#saveClick .fa").classList.remove("fa-bookmark-o");
      document.querySelector("#saveClick .fa").classList.add("fa-bookmark");
      document.querySelector("#saveClick .articleView-item").textContent = "已收藏";
    }
    if (favorite.liked.ok === true) {
      thumbup.classList.remove("fa-thumbs-o-up");
      thumbup.classList.add("fa-thumbs-up");
      thumbup.title = "你已按讚此篇文章!";
    }

    //私訊button
    const privateMessage = document.querySelector("#privateMessage");
    if (writer_id != authResult.user.id) {
      privateMessage.style = "display:inline-block;";
    }

    //留言
    commentBtn.addEventListener("click", async (e) => {
      const comment = document.querySelector("#comment");
      if (comment.value === "") {
        e.preventDefault();
        const snackbar = document.querySelector("#snackbar");
        snackbar.className = "show";
        setTimeout(() => {
          snackbar.className = snackbar.className.replace("show", "");
        }, 3000);
      } else {
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
          createComment.renderComment(comments, "new");
        } else {
          console.log("留言return異常:", result);
        }
      }
    });
    //按讚
    thumbup.addEventListener("click", async () => {
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
        }),
      };
      const result = await fetchData(url, options);
      console.log("article_like result:", result);
      let likeQty = parseInt(document.querySelector("#article_like").textContent);
      const showLikeQty = document.querySelector("#article_like");
      const alertLikeQty = document.createElement("span");
      alertLikeQty.classList.add("like-animation");
      if (result.ok === true) {
        thumbup.classList.remove("fa-thumbs-o-up");
        thumbup.classList.add("fa-thumbs-up");
        showLikeQty.textContent = likeQty + 1;
        alertLikeQty.textContent = "+1";
        alertLikeQty.style = "color:green";
        thumbup.title = "你已按讚此篇文章!";
      } else if (result.ok === false) {
        thumbup.classList.remove("fa-thumbs-up");
        thumbup.classList.add("fa-thumbs-o-up");
        showLikeQty.textContent = likeQty - 1;
        alertLikeQty.textContent = "-1";
        alertLikeQty.style = "color:red";
        thumbup.title = "給這篇文章一個讚!";
      } else {
        console.log("error:", result.message);
      }
      thumbup.parentElement.appendChild(alertLikeQty);
      alertLikeQty.addEventListener("animationend", () => {
        alertLikeQty.remove();
      });
    });
    //私訊
    privateMessage.addEventListener("click", () => {
      const roomId = createRoomId(writer_id, authResult.user.id);
      location.href = `/chat?roomId=${roomId}`;
    });
    //收藏文章
    saveClick.addEventListener("click", async () => {
      const url = "api/article/favorite";
      const options = {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ article_id: article_id }),
      };
      const result = await fetchData(url, options);
      if (result.ok) {
        if (result.message === "delete save_article") {
          document.querySelector("#saveClick .fa").classList.remove("fa-bookmark");
          document.querySelector("#saveClick .fa").classList.add("fa-bookmark-o");
          document.querySelector("#saveClick .articleView-item").textContent = "收藏";
        } else {
          document.querySelector("#saveClick .fa").classList.remove("fa-bookmark-o");
          document.querySelector("#saveClick .fa").classList.add("fa-bookmark");
          document.querySelector("#saveClick .articleView-item").textContent = "已收藏";
        }
      }
    });
  }
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

function createRoomId(userId1, userId2) {
  return [userId1, userId2].sort().join("-");
}
