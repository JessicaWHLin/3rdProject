import {
  back_Homepage,
  go_signpage,
  post_article,
  CheckAuth_WithToken,
  showName,
  userless,
  signout,
  search,
  signin,
} from "./module.js";
back_Homepage();
go_signpage();
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

//註冊
const signupBtn = document.querySelector("#signupBtn");
const signinEmail = document.querySelector("#signinEmail");
const signinPassword = document.querySelector("#signinPassword");
const re_email = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const re_password = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,12}$/;
signupBtn.addEventListener("click", async (e) => {
  const username = document.querySelector("#signupUsername");
  const email = document.querySelector("#signupEmail");
  const password = document.querySelector("#signupPassword");
  if ((username.value == "") | (email.value == "") | (password.value == "")) {
    e.preventDefault();
    alert("請完成輸入");
  } else if (!email.value.match(re_email)) {
    e.preventDefault();
    alert("請輸入正確Email");
  } else if (!password.value.match(re_password)) {
    e.preventDefault();
    alert("密碼組成未按規定");
  } else {
    const signupData = {
      username: username.value,
      email: email.value,
      password: password.value,
    };
    const urlSignup = "/api/auth/signup";
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupData),
    };
    console.log(signupData);
    const result_signup = await fetchData(urlSignup, options);

    if (result_signup.ok === true) {
      document.querySelector(".signupResult").textContent = "註冊成功";
      document.querySelector(".signupResult").style = "color:green;font-weight:700;";
      signinEmail.value = email.value;
      signinPassword.vlaue = password.value;
      //TODO:把輸入都清空
      username.value = "";
      email.value = "";
      password.value = "";
    }
    if (result_signup.message === "Email existed") {
      document.querySelector(".signupResult").textContent = "Email已存在";
      document.querySelector(".signupResult").style = "color:red;font-weight:700;";
    }
  }
});
//登入
await signin();

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
