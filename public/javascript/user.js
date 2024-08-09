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
const re = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/;
signupBtn.addEventListener("click", async () => {
  const username = document.querySelector("#signupUsername").value;
  const email = document.querySelector("#signupEmail").value;
  const password = document.querySelector("#signupPassword").value;
  const signupData = { username: username, email: email, password: password };
  const urlSignup = "/api/auth/signup";
  const object = {};
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signupData),
  };
  console.log(signupData);
  const result = await fetchData(urlSignup, options);

  if (result.ok == true) {
    document.querySelector(".signupResult").textContent = "註冊成功";
    document.querySelector(".signupResult").style.color = "green";
    document.querySelector(".signupResult").style.fontSize = "700";
    //TODO:把輸入都清空
  }
  if (result.error == "Existed Email") {
    document.querySelector(".signupResult").textContent = "Email已存在";
    document.querySelector(".signupResult").style.color = "red";
    document.querySelector(".signupResult").style.fontSize = "700";
  }
});
//登入
const signinBtn = document.querySelector("#signinBtn");
signinBtn.addEventListener("click", async () => {
  const signinEmail = document.querySelector("#signinEmail").value;
  const signinPassword = document.querySelector("#signinPassword").value;
  const signinData = { email: signinEmail, password: signinPassword };
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
    console.log({ error: result.message });
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
