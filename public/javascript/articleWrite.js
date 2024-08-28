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
//----------------------------------------------
//預覽圖片
const input = document.querySelector("#inputImage");
const imageContainer = document.querySelector(".uploadImages");
input.addEventListener("change", upload);

const zoneTag = document.querySelector("#zone");
const classTag = document.querySelector("#class");
const zoneSelect = document.querySelector("#zoneList");
const classSelect = document.querySelector("#classList");
const title = document.querySelector("#title");
const textContent = document.querySelector(".textarea");
const postBtn = document.querySelector("#postArticle");
zoneSelect.addEventListener("change", () => {
  zoneTag.textContent = ">" + zoneSelect.value;
});
classSelect.addEventListener("change", () => {
  classTag.textContent = ">" + classSelect.value;
});
postBtn.addEventListener("click", async (e) => {
  if (
    (zoneSelect.value == "(區域)") |
    (classSelect.value == "(分類)") |
    (title.value == "") |
    (textContent.value == "")
  ) {
    e.preventDefault();
    alert("請完成文章內容");
  } else {
    const formdata = new FormData();
    formdata.append("zone", zoneSelect.value);
    formdata.append("Class", classSelect.value);
    formdata.append("title", title.value);
    formdata.append("content", textContent.value);
    console.log("input.files.length:", input.files.length);
    if (input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        formdata.append("images", input.files[i]);
      }
    }

    const url = "/api/article/write";
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    };
    const result = await fetchData(url, options);
    console.log("write result:", result);
    freeURLMemory();
    if (result.ok) {
      alert("文章發佈成功!");
      location.href = "/";
    }
  }
});
//-----------------------------------------------------
function upload(e) {
  let uploadImg = e.target.files || e.dataTransfer.files;
  for (let i = 0; i < input.files.length; i++) {
    let image = document.createElement("img");
    image.classList.add("articleWrite-uploadImg");
    image.src = window.URL.createObjectURL(uploadImg[i]);
    imageContainer.appendChild(image);
  }
}
function freeURLMemory() {
  let images = document.querySelectorAll(".articleWrite-uploadImg");
  for (let i = 0; i < images.length; i++) {
    URL.revokeObjectURL(images[i].src);
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
