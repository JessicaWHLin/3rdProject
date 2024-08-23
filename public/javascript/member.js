import {
  back_Homepage,
  go_signpage,
  post_article,
  CheckAuth_WithToken,
  showName,
  signout,
  userless,
  CreateArticleLine,
} from "./module.js";
back_Homepage();
go_signpage();

const token = localStorage.getItem("token");
if (token) {
  const authResult = await CheckAuth_WithToken(token);
  post_article();
  signout("/");
  console.log("authResult:", authResult);
  if (authResult.user) {
    showName(authResult.user.name);
  }
} else {
  console.log("status:un-signin");
  userless();
}
//照片上傳
const profilePhoto = document.querySelector("#photo");
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
    document.querySelector(".member-photoContainer").style = "background:transparent;";
  }
});

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
