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
const profilePhoto = document.querySelector("#photo");
const photoContainer = document.querySelector("#photoContainer");
const name = document.querySelector("#name");
const Email = document.querySelector("#email");
const password = document.querySelector("#password");
const birthday = document.querySelector("#birthday");
const aboutMe = document.querySelector("#aboutMe");
if (token) {
  const authResult = await CheckAuth_WithToken(token);
  post_article();
  signout("/");
  console.log("authResult:", authResult);
  if (authResult.user) {
    showName(authResult.user.name);
    //render會員資料
    const url = "/api/member/profile";
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      "Content-Type": "application/json",
    };
    const profile = await fetchData(url, options);
    if (profile.profileData.profile_photo) {
      profilePhoto.src = profile.profileData.profile_photo;
      photoContainer.style = "background:transparent;";
    }
    name.value = profile.profileData.name;
    Email.value = profile.profileData.email;
    password.value = "*******";
    birthday.value = profile.profileData.birthday;
    aboutMe.value = profile.profileData.aboutMe;
    //大頭照上傳
    const photoInput = document.querySelector("#profilePhoto");
    const uploadBtn = document.querySelector("#upload");
    uploadBtn.addEventListener("click", () => {
      photoInput.click();
    });
    photoInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      console.log("file=", file);
      if (file) {
        const formdata = new FormData();
        formdata.append("images", file);
        const url = "/api/member/photo";
        const options = {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formdata,
        };
        const result = await fetchData(url, options);
        profilePhoto.src = `${result.photo_url}`;
        profilePhoto.style = "display:block;";
        photoContainer.style = "background:transparent;";
      }
    });
    //更新會員資料
    const updateProfileBtn = document.querySelector("#updateBtn");
    updateProfileBtn.addEventListener("click", async () => {
      const updateProfile = {
        name: name.value,
        password: password.value,
        birthday: birthday.value,
        aboutMe: aboutMe.value,
      };
      const url = "/api/member/profile";
      const options = {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(updateProfile),
      };
      const result = await fetchData(url, options);
      console.log({ result });
      if (result.ok) {
        location.href = "/member";
      }
    });
    //render 文章資料
    const myArticleBtn = document.querySelector("#myArticles");
    const commentArticleBtn = document.querySelector("#commentArticles");
    const savedArticleBtn = document.querySelector("#savedArticles");

    myArticleBtn.addEventListener("click", async () => {
      myArticleBtn.classList.add("underline");
      commentArticleBtn.classList.remove("underline");
      savedArticleBtn.classList.remove("underline");
      const elements = document.querySelectorAll("#myArticleContainer .articleList-line");
      elements.forEach((element) => {
        element.remove();
      });
      const url = "/api/member/article?item=myArticles";
      const options = {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      };
      const result = await fetchData(url, options);
      const articleItems = result.result;
      const myArticle = new CreateArticleLine("#myArticleContainer");
      articleItems.forEach((item) => {
        myArticle.createLine(item);
      });
      document
        .querySelectorAll("#myArticleContainer .articleList-line")
        .forEach((line, index) => {
          line.addEventListener("click", () => {
            location.href = `/articleView?article_id=${articleItems[index].id}`;
          });
        });
    });

    commentArticleBtn.addEventListener("click", async () => {
      myArticleBtn.classList.remove("underline");
      commentArticleBtn.classList.add("underline");
      savedArticleBtn.classList.remove("underline");
      const elements = document.querySelectorAll("#myArticleContainer .articleList-line");
      elements.forEach((element) => {
        element.remove();
      });
      const url = "/api/member/article?item=commentArticles";
      const options = {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      };
      const result = await fetchData(url, options);
      const articleItems = result.result;
      const commentArticle = new CreateArticleLine("#myArticleContainer");
      articleItems.forEach((item) => {
        commentArticle.createLine(item);
      });
      document
        .querySelectorAll("#myArticleContainer .articleList-line")
        .forEach((line, index) => {
          line.addEventListener("click", () => {
            location.href = `/articleView?article_id=${articleItems[index].id}`;
          });
        });
    });
    savedArticleBtn.addEventListener("click", async () => {
      myArticleBtn.classList.remove("underline");
      commentArticleBtn.classList.remove("underline");
      savedArticleBtn.classList.add("underline");
      const elements = document.querySelectorAll("#myArticleContainer .articleList-line");
      elements.forEach((element) => {
        element.remove();
      });
      const url = "/api/member/article?item=savedArticles";
      const options = {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      };
      const result = await fetchData(url, options);
      const articleItems = result.result;
      const savedArticle = new CreateArticleLine("#myArticleContainer");
      articleItems.forEach((item) => {
        savedArticle.createLine(item);
      });
      document
        .querySelectorAll("#myArticleContainer .articleList-line")
        .forEach((line, index) => {
          line.addEventListener("click", () => {
            location.href = `/articleView?article_id=${articleItems[index].article_id}`;
          });
        });
    });

    //從首頁來
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get("source");
    if (source === "myArticles") {
      myArticleBtn.click();
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } else if (source === "commentArticles") {
      commentArticleBtn.click();
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } else if (source === "savedArticles") {
      savedArticleBtn.click();
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } else {
      if (myArticleBtn) {
        myArticleBtn.click();
      }
    }
  } //auth.user
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
