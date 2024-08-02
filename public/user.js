import { back_Homepage, go_signpage } from "./module.js";
back_Homepage();
go_signpage();
//註冊
const signupBtn = document.querySelector("#signupBtn");
const re = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/;
signupBtn.addEventListener("click", () => {
  const username = document.querySelector("#signupUsername").value;
  const email = document.querySelector("#signupEmail").value;
  const password = document.querySelector("#signupPassword").value;
  const signupData = { username: username, email: email, password: password };
  const url = "/api/signup";
  const object = {};
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signupData),
  };
  console.log(signupData);
  const result = fetchData(url, options);
});

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
