import express from "express";
import path from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
dotenv.config();
import { fileURLToPath } from "url";
import morgan from "morgan";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//Routers
import authRouter from "./routes/authRouter.js";

//環境參數
const bucketName = process.env.bucket_name;
const bucketRegion = process.env.bucket_region;
const accessKey = process.env.access_key;
const secretAccessKey = process.env.secret_access_key;
const port = process.env.port;
const client = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const app = express();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("combined"));
app.use("/api/auth", authRouter);

//靜態網頁
app.use(express.static(path.join(__dirname, "public")));
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/articleWrite", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "articleWrite.html"));
});
app.get("/articleView", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "articleView.html"));
});
app.get("/articleList", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "articleList.html"));
});
app.get("/user", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "user.html"));
});
app.get("/messageboard", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "message.html"));
});

//loader.io
app.get("/loaderio-3d25eebd5ba80d681bf17e6486b56acb", function (req, res) {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "loaderio-3d25eebd5ba80d681bf17e6486b56acb.txt"
    )
  );
});

//week1
app.get("/api/message", (req, res) => {
  pool.getConnection((error, connection98) => {
    if (error) {
      throw { error: error };
    } else {
      const sql_query =
        "select id, content,imageName,imageUrl from messages order by created_at desc";
      connection98.query(sql_query, (error, result, fields) => {
        if (error) {
          throw { error: error };
        }
        res.json({ result: result });
        connection98.release();
      });
    }
  });
});
app.post("/api/message", upload.single("image"), async (req, res) => {
  const message = req.body.message;
  let fileOriginName;
  let imagePath;

  if (req.file) {
    const file = req.file.originalname;
    console.log("file=" + file);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = uniqueSuffix + "-" + file;
    fileOriginName = file;
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    try {
      const command = new PutObjectCommand(params);
      const response = await client.send(command);
      imagePath = `https://d1g5nr6pevif22.cloudfront.net/${fileName}`;
    } catch (error) {
      return { error: error };
    }
  } else {
    //只有留言
    fileOriginName = null;
    imagePath = null;
  }
  try {
    const sql_msg =
      "insert into messages(content,imageName, imageUrl)values(?,?,?)";
    pool.getConnection((error, connection99) => {
      console.log("DB連線正常");
      console.log(message, fileOriginName, imagePath);
      if (error) {
        throw { error: error };
      } else {
        connection99.execute(
          sql_msg,
          [message, fileOriginName, imagePath],
          (error, result) => {
            if (error) {
              throw { error: error };
            }
          }
        );
        res.json({ ok: true });
        connection99.release();
      }
    });
  } catch (error) {
    return { error: error };
  }
});

const server = app.listen(port, function () {
  console.log("--------啟動測試-----------");
  console.log("Server is running at https://www.trippals.site");
  console.log(`Server is running at port: ${port}`);
});
server.setTimeout(10 * 60 * 1000); //10分鐘限制
