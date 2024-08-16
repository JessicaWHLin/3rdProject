import AuthModel from "../models/authModel.js";
export function setupSocket(io) {
  io.on("connection", async (socket) => {
    const roomId = socket.handshake.query.room;
    let msgList = [];

    socket.join(roomId);

    socket.on("history", async (historyList) => {
      io.to(roomId).emit("history", historyList);
      console.log("historyList", historyList);
    });

    socket.on("chat message", async (chatInfo) => {
      const createdAt = Date.now();
      const fullToken = chatInfo.token;
      const auth = await AuthModel.checkAuth(fullToken);

      msgList.push({
        memberId: auth.user.id,
        name: auth.user.name,
        msg: chatInfo.msg,
        createdAt,
      });
      io.to(roomId).emit("chat message", {
        memberId: auth.user.id,
        name: auth.user.name,
        msg: chatInfo.msg,
        createdAt,
      });
    });
  });
}
