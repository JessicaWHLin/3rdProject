import AuthModel from "../models/authModel.js";

const authController = {
  signup: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const result = await AuthModel.signup(username, email, password);
      if (result.ok) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  signin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await AuthModel.signin(email, password);
      if (result.ok === true) {
        res.status(200).json(result);
      }
      if (result.ok === false) {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  checkAuth: async (req, res) => {
    try {
      const fullToken = req.headers.authorization;
      const result = await AuthModel.checkAuth(fullToken);
      if (result.ok) {
        res.status(200).json(result);
      } else if (result.error === true) {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default authController;
