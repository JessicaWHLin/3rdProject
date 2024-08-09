import ArticleModel from "../models/articleModel.js";
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

const articleController = {
  write: async (req, res) => {
    try {
      //檢查member auth
      const fullToken = req.headers.authorization;
      const auth = await AuthModel.checkAuth(fullToken);
      let filename = [];
      let files = [];
      let filePath = [];
      let params = [];
      let command = [];
      console.log("article auth:", auth);
      if (auth.ok) {
        const { zone, Class, title, content } = req.body;
        if (req.files) {
          for (let i = 0; i < req.files.length; i++) {
            files[i] = req.files[i].originalname;
            const uniqueSuffix =
              Date.now() + "-" + Math.round(Math.random() * 1e6);
            filename[i] = uniqueSuffix + "-" + files[i];
            params[i] = {
              Bucket: bucketName,
              Key: filename[i],
              Body: req.files[i].buffer,
              ContentType: req.files[i].mimetype,
            };
            try {
              command[i] = new PutObjectCommand(params[i]);
              await client.send(command[i]);

              filePath[
                i
              ] = `https://d1g5nr6pevif22.cloudfront.net/${filename[i]}`;
            } catch (error) {
              res.status(500).json({ error: error.message });
            }
          }
        }
        // console.log("req=", { zone, Class, title, content });
        // console.log("files:", files, "filePath:", filePath);
        const result = await ArticleModel.write(
          auth.user,
          zone,
          Class,
          title,
          content,
          files,
          filePath
        );
        if (result.ok) {
          res.status(200).json(result);
        } else {
          res.status(500).json({ error: result.message });
        }
      }
    } catch (error) {
      console.log("p.64 con error", error.message);
      res.status(500).json({ error: error.message });
    }
  },
};

export default articleController;
