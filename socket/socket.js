import AuthModel from "../models/authModel.js";
export function setupSocket(io) {
  io.of("/chat").on("connection", async (socket) => {
    // Client端在建立連線時帶的參數;
    const roomId = socket.handshake.query.room;
    const fullToken = socket.handshake.query.Authorization;
    const auth = await AuthModel.checkAuth(fullToken);
    let msgList = [];
    // console.log("room:", roomId);

    socket.join(roomId);

    socket.on("history", async (msgList) => {
      io.of("/chat").to(roomId).emit("history", msgList);
      console.log("msgList:", msgList);
    });

    socket.on("chat message", async (msg) => {
      // console.log(msg);
      const createdAt = Date.now();
      msgList.push({ id: auth.user.id, name: auth.user.name, msg, createdAt });
      io.of("/chat")
        .to(roomId)
        .emit("chat message", { id: auth.user.id, name: auth.user.name, msg, createdAt });
    });
  });
}
