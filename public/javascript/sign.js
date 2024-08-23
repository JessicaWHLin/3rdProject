import {
  back_Homepage,
  go_signpage,
  post_article,
  CheckAuth_WithToken,
  showName,
  userless,
  signout,
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

//註冊
const signupBtn = document.querySelector("#signupBtn");
const signinEmail = document.querySelector("#signinEmail");
const signinPassword = document.querySelector("#signinPassword");
const re = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/;
signupBtn.addEventListener("click", async () => {
  const username = document.querySelector("#signupUsername");
  const email = document.querySelector("#signupEmail");
  const password = document.querySelector("#signupPassword");
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
    document.querySelector(".signupResult").style = "color:green";
    document.querySelector(".signupResult").style = "font-weight:700;";
    signinEmail.value = email.value;
    signinPassword.vlaue = password.value;
    //TODO:把輸入都清空
    username.value = "";
    email.value = "";
    password.value = "";
  }
  if (result_signup.message === "Email existed") {
    document.querySelector(".signupResult").textContent = "Email已存在";
    document.querySelector(".signupResult").style = "color:red";
    document.querySelector(".signupResult").style = "font-weight:700;";
  }
});
//登入
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
