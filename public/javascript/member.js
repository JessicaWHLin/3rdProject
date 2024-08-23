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
    console.log(profile.profileData);
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
