import { back_Homepage, go_signpage, post_article } from "./module.js";
back_Homepage();
go_signpage();
post_article();
document.querySelector(".link").addEventListener("click", () => {
  location.href = "/articleView";
});
