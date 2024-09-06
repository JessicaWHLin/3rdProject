import MemberModel from "../models/memberModel.js";
import AuthModel from "../models/authModel.js";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
dotenv.config();
//環境參數
const bucketName = process.env.bucket_name;
const bucketRegion = process.env.bucket_region;
const accessKey = process.env.access_key;
const secretAccessKey = process.env.secret_access_key;
const client = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const memberController = {
  photo: async (req, res) => {
    try {
      const fullToken = req.headers.authorization;
      const auth = await AuthModel.checkAuth(fullToken);
      let filename;
      let files;
      let filePath;
      let params;
      let command;
      if (auth.ok) {
        if (req.files) {
          files = req.files[0].originalname;
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
          filename = uniqueSuffix;
          params = {
            Bucket: bucketName,
            Key: filename,
            Body: req.files[0].buffer,
            ContentType: req.files[0].mimetype,
          };
          try {
            command = new PutObjectCommand(params);
            await client.send(command);

            filePath = `https://d1g5nr6pevif22.cloudfront.net/${filename}`;
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        }
        const result = await MemberModel.profilePhoto(auth.user.id, filePath);
        console.log("上傳圖片=", result);
        if (result.ok) {
          res.status(200).json(result);
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  profile: async (req, res) => {
    try {
      const fullToken = req.headers.authorization;
      const auth = await AuthModel.checkAuth(fullToken);
      if (auth.ok) {
        const result = await MemberModel.profile(auth.user.id);
        res.status(200).json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  updateProfile: async (req, res) => {
    try {
      const { name, password, birthday, aboutMe } = req.body;
      const updated_at = new Date().toISOString();
      const formattedForDB = updated_at.slice(0, 19).replace("T", " "); // 转换为 'YYYY-MM-DD HH:MM:SS' 格式
      const fullToken = req.headers.authorization;
      const auth = await AuthModel.checkAuth(fullToken);
      if (auth.ok) {
        console.log({ name, password, birthday, aboutMe, updated_at });
        const result = await MemberModel.updateProfile(
          auth.user.id,
          name,
          password,
          birthday,
          aboutMe,
          formattedForDB
        );
        if (result.ok) {
          res.status(200).json(result);
        } else {
          res.status(400).json(result);
        }
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  articles: async (req, res) => {
    try {
      const fullToken = req.headers.authorization;
      const auth = await AuthModel.checkAuth(fullToken);
      if (auth.ok) {
        const { item } = req.query;
        const result = await MemberModel.findArticles(auth.user.id, item);
        res.status(200).json({ ok: true, result });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default memberController;
