import AuthModel from "../models/authModel.js";
import ChatModel from "../models/chatModel.js";
export function setupSocket(io) {
  io.on("connection", async (socket) => {
    const roomId = socket.handshake.query.room;

    socket.join(roomId);
    //loading歷史訊息:只有在一開始連線時
    try {
      const result = await ChatModel.queryHistoryMsg(roomId);
      if (result.ok) {
        const history = result.result;
        socket.emit("history", history);
        console.log(history);
      }
    } catch (error) {
      console.log("error:", error.message);
    }

    //發送訊息到前端
    socket.on("chat message", async (chatInfo) => {
      const fullToken = chatInfo.token;
      const auth = await AuthModel.checkAuth(fullToken);
      const datetime = new Date();
      console.log(datetime);

      const isoString = datetime.toISOString();
      const formattedForDB = datetime.toISOString().slice(0, 19).replace("T", " "); // 转换为 'YYYY-MM-DD HH:MM:SS' 格式
      console.log("formattedForDB:", formattedForDB);
      io.to(roomId).emit("chat message", {
        memberId: auth.user.id,
        name: auth.user.name,
        msg: chatInfo.msg,
        localtime: isoString,
      });
      try {
        const result = await ChatModel.saveHistoryMsg(
          roomId,
          auth.user.id,
          chatInfo.msg,
          formattedForDB
        );
      } catch (error) {
        console.log("save error:", error.message);
      }
    });
  });
}
