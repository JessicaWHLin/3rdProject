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
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
            filename[i] = uniqueSuffix;
            params[i] = {
              Bucket: bucketName,
              Key: filename[i],
              Body: req.files[i].buffer,
              ContentType: req.files[i].mimetype,
            };
            try {
              command[i] = new PutObjectCommand(params[i]);
              await client.send(command[i]);

              filePath[i] = `https://d1g5nr6pevif22.cloudfront.net/${filename[i]}`;
            } catch (error) {
              res.status(500).json({ error: error.message });
            }
          }
        }
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
      res.status(500).json({ error: error.message });
    }
  },

  listZone: async (req, res) => {
    try {
      const { zone } = req.query;
      const result = await ArticleModel.findArticle(zone);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  articleDetail: async (req, res) => {
    try {
      const { article_id } = req.query;
      console.log({ article_id });
      const contentResult = await ArticleModel.findArticleContent(article_id);
      const imagesRresult = await ArticleModel.findArticleImages(article_id);

      if (contentResult.ok && imagesRresult.ok) {
        res.status(200).json({ content: contentResult, images: imagesRresult });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  comment: async (req, res) => {
    try {
      const fullToken = req.headers.authorization;
      const auth = await AuthModel.checkAuth(fullToken);
      if (auth.ok) {
        const member_id = auth.user.id;
        const { comment, article_id } = req.body;
        const result = await ArticleModel.comment(comment, article_id, member_id);
        if (result.ok) {
          res.status(200).json({ result });
        } else {
          res.status(500).json({ ok: false, message: error.message });
        }
      } else {
        res.status(400).json({ ok: false, message: "un-signin" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  findComment: async (req, res) => {
    try {
      const { article_id } = req.query;
      const result = await ArticleModel.findComment(article_id);
      if (result.ok) {
        res.status(200).json({ result });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  like: async (req, res) => {
    try {
      const fullToken = req.headers.authorization;
      const auth = await AuthModel.checkAuth(fullToken);
      if (auth.ok) {
        const member_id = auth.user.id;
        const { article_id, comment_id } = req.body;
        if (article_id != null) {
          const result = await ArticleModel.articleLike(article_id, member_id);
          if (result) {
            res.status(200).json(result);
          }
        } else {
          const result = await ArticleModel.commentLike(comment_id, member_id);
          if (result) {
            res.status(200).json(result);
          }
        }
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  ranking: async (req, res) => {
    try {
      const result_latest = await ArticleModel.latest();
      const result_popular = await ArticleModel.popular();
      if (result_latest) {
        res.status(200).json({ ok: true, result_latest });
      } else {
        res.status(200).json({ ok: false });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default articleController;
