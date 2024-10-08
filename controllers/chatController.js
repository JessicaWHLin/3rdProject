import ChatModel from "../models/chatModel.js";

const chatController = {
  query: async (req, res) => {
    try {
      const { member_id } = req.query;
      const result = await ChatModel.queryRoomId(member_id);
      if (result.ok) {
        res.status(200).json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  senders: async (req, res) => {
    try {
      const { member_ids } = req.query;
      const result = await ChatModel.querySender(member_ids);
      if (result.ok) {
        res.status(200).json({ result });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default chatController;
