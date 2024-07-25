class CreateMessage {
  constructor(containerClass) {
    this.container = document.querySelector(containerClass);
  }
  add_message(data) {
    // console.log(data);
    let messageContent = document.createElement("div");
    messageContent.classList.add("message");
    messageContent.textContent = data.content;
    let separator = document.createElement("div");
    separator.classList.add("separator");
    let photo = document.createElement("img");
    photo.classList.add("image");
    if (data.imageUrl == null) {
      photo.style = "display:none;";
    } else {
      photo.src = data.imageUrl;
    }
    this.container.appendChild(messageContent);
    this.container.appendChild(photo);
    this.container.appendChild(separator);
  }
}

fetch("/api/message", { method: "GET" })
  .then((response) => {
    return response.json();
  })
  .then((messages) => {
    let messageElement = new CreateMessage(".messageContainer");
    messages.result.forEach((message) => {
      messageElement.add_message(message);
    });
  });

let submitBtn = document.querySelector("#upload");
submitBtn.addEventListener("click", async (event) => {
  let inputImg = document.querySelector("#photoInput"); //圖片
  let message = document.querySelector("#message"); //文字
  if (inputImg.value == "" && message.value == "") {
    event.preventDefault();
    alert("請至少輸入留言");
  } else {
    const formdata = new FormData();
    formdata.append("message", message.value);
    if (inputImg.files.length > 0) {
      formdata.append("image", inputImg.files[0]);
    }
    const url = "/api/message";
    const options = {
      method: "POST",
      body: formdata,
    };
    let createMessage = await fetchData(url, options);
    console.log(createMessage);
    location.href = "/";
  }
});

//函式區
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
