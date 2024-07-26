import express from "express";
import path from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mysql from "mysql2";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
dotenv.config();
import { fileURLToPath } from "url";
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

console.log(
  "accessKey=" + accessKey,
  "Region=" + bucketRegion,
  "secretAccessKey=" + secretAccessKey
);
const app = express();
const port = 3000;

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

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/message", (req, res) => {
  pool.getConnection((error, connection1) => {
    if (error) {
      throw { error: error };
    } else {
      const sql_query =
        "select id, content,imageName,imageUrl from messages order by created_at desc";
      connection1.query(sql_query, (error, result, fields) => {
        if (error) {
          throw { error: error };
        }
        res.json({ result: result });
        connection1.release();
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
    console.log("params key=" + params.Key);
    console.log("params Bucket=" + params.Bucket);

    try {
      const command = new PutObjectCommand(params);
      console.log("command=" + command);
      const response = await client.send(command);
      console.log("S3 response=" + response);
      imagePath = `https://d1g5nr6pevif22.cloudfront.net/${fileName}`;
      console.log("try的最後一行執行OK");
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
    pool.getConnection((error, connection2) => {
      console.log("DB連線正常");
      console.log(message, fileOriginName, imagePath);
      if (error) {
        throw { error: error };
      } else {
        connection2.execute(
          sql_msg,
          [message, fileOriginName, imagePath],
          (error, result) => {
            if (error) {
              throw { error: error };
            }
          }
        );
        res.json({ ok: true });
        connection2.release();
      }
    });
  } catch (error) {
    return { error: error };
  }
});

const server = app.listen(port, function () {
  console.log(`Server is running at http://trippals.site:${port}`);
});
server.setTimeout(10 * 60 * 1000); //10分鐘限制
