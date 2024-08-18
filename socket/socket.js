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
      }
    } catch (error) {
      console.log("error:", error.message);
    }

    //發送訊息到前端
    socket.on("chat message", async (chatInfo) => {
      const fullToken = chatInfo.token;
      const auth = await AuthModel.checkAuth(fullToken);
      const datetime = new Date(Date.now());
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const localtime = datetime.toLocaleString(undefined, {
        timeZone: userTimeZone,
        hour12: false,
      });
      const isoString = datetime.toISOString();
      const formattedForDB = isoString.replace("T", " ").substring(0, 19); // 转换为 'YYYY-MM-DD HH:MM:SS' 格式

      io.to(roomId).emit("chat message", {
        memberId: auth.user.id,
        name: auth.user.name,
        msg: chatInfo.msg,
        localtime,
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
