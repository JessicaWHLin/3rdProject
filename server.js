import express from "express";
import path from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mysql from "mysql2";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
dotenv.config();
import { fileURLToPath } from "url";
import morgan from "morgan";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const host = process.env.host;
const user = process.env.user;
const password = process.env.password;
const database = process.env.database;
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

const app = express();
const port = 4000;

const pool = mysql.createPool({
  host: host,
  user: user,
  password: password,
  database: database,
  waitForConnections: true,
  connectionLimit: 5,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("combined"));
//靜態網頁
app.use(express.static(path.join(__dirname, "public")));
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/article", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "article.html"));
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
console.log("--------npm測試-----------");
//api
//註冊
app.post("/api/signup", (req, res) => {
  pool.getConnection((error, connection1) => {
    if (error) {
      return res.status(500).json({ error: error.message, message: "1" });
    } else {
      console.log("DB連線成功");
      let { username, email, password } = req.body;

      //檢查有無重複
      connection1.query(
        "select * from member where email =?",
        [email],
        (error, result) => {
          if (error) {
            connection1.release();
            return res.status(500).json({ error: error.message, message: "2" });
          }

          if (result.length > 0) {
            connection1.release();
            return res.status(400).json({ error: "Existed Email" });
          } else {
            //新email
            const sql = "insert into member(name,email,password)values(?,?,?)";
            const val = [username, email, password];
            console.log(
              `receive req：username=${username}, Email=${email}, password=${password}`
            );
            connection1.execute(sql, val, (error, result) => {
              console.log("executed.");
              connection1.release();
              if (error) {
                return res
                  .status(500)
                  .json({ error: error.message, message: "3" });
              }
              res.json({ ok: true });
            });
          }
        }
      );
    }
  });
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
  console.log("Server is running at https://trippals.site");
});
server.setTimeout(10 * 60 * 1000); //10分鐘限制
