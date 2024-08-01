export function back_Homepage() {
  const homeIcon = document.querySelector("#home");
  homeIcon.addEventListener("click", () => {
    const url = "/";
    fetch(url)
      .then((response) => response)
      .then((data) => {
        location.href = url;
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  });
}
