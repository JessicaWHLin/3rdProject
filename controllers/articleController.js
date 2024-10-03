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
      } else {
        res.status(400).json({ ok: false, message: "un-signin" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  listArticle: async (req, res) => {
    try {
      const { zone, keyword, item, page } = req.query;

      const result = await ArticleModel.findArticle(zone, keyword, item, page);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  articleDetail: async (req, res) => {
    try {
      const { article_id } = req.query;
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
        }
      } else {
        res.status(400).json({ ok: false, message: "un-signin" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  ranking: async (req, res) => {
    try {
      const result_latest = await ArticleModel.latest();
      const result_popular = await ArticleModel.popular();
      if (result_latest && result_popular) {
        res.status(200).json({ result_latest, result_popular });
      } else {
        res.status(200).json({ ok: false });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  favorite: async (req, res) => {
    try {
      const fullToken = req.headers.authorization;
      const auth = await AuthModel.checkAuth(fullToken);
      if (auth.ok) {
        const { article_id } = req.body;
        const result = await ArticleModel.savedArticles(auth.user.id, article_id);
        if (result.ok) {
          res.status(200).json({ ok: true, message: result.message });
        }
      } else {
        res.status(400).json({ ok: false, message: "un-signin" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  findFavorite: async (req, res) => {
    try {
      const fullToken = req.headers.authorization;
      const auth = await AuthModel.checkAuth(fullToken);
      if (auth.ok) {
        const { article_id } = req.query;
        const result_saved = await ArticleModel.findSavedArticle(
          auth.user.id,
          article_id
        );
        const result_liked = await ArticleModel.findLikedArticle(
          auth.user.id,
          article_id
        );
        if (result_saved && result_liked) {
          res.status(200).json({ saved: result_saved, liked: result_liked });
        }
      } else {
        res.status(400).json({ ok: false, message: "un-signin" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  viewCount: async (req, res) => {
    try {
      const { article_id } = req.body;
      const tracking_id = req.headers.cookie.split("=")[1];
      const result = await ArticleModel.view(article_id, tracking_id);
      if (result.ok) {
        res.status(200).json({ ok: true });
      }
    } catch (error) {
      res.status(500).json({ error: true, message: error.message });
    }
  },
  sumViewCount: async (req, res) => {
    try {
      const { article_id } = req.query;
      const result = await ArticleModel.sumViewCount(article_id);
      if (result.ok) {
        res.status(200).json(result);
      }
    } catch (error) {
      return res.status(500), json({ error: true, message: error.message });
    }
  },
};

export default articleController;
