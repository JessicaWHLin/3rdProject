import UserModel from "../models/userModel.js";

const authController = {
  signup: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      console.log("req=", { username, email, password });
      const result = await UserModel.signup(username, email, password);
      console.log("con-result:" + result);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  signin: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("con:", { email, password });
      const result = await UserModel.signin(email, password);
      console.log("con-result:", result);
      if (result.ok) {
        res.status(201).json(result);
      }
      if (!result.ok) {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default authController;
