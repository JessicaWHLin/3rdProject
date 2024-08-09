import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();
//環境參數
const host = process.env.host;
const user = process.env.user;
const password = process.env.password;
const database = process.env.database;
const pool = mysql.createPool({
  host: host,
  user: user,
  password: password,
  database: database,
  waitForConnections: true,
  connectionLimit: 5,
});

//檢查連線
pool.getConnection((error, connection0) => {
  if (error) {
    console.log("error:", error.message);
    return;
  }
  console.log("articleModel DB connection OK");
  connection0.release();
});

class ArticleModel {
  //發表
  static async write(user, zone, Class, title, content, files, filePath) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection1) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }
        const sql =
          "insert into article(member_id,zones,class,title,content)values(?,?,?,?,?)";
        const val = [user.id, zone, Class, title, content];
        connection1.execute(sql, val, (error, result) => {
          connection1.release();
          if (error) {
            return reject({
              error: true,
              message: error.message + "insert content",
            });
          }
        });
        //文章編號
        const sql_articleID =
          "select id from article where title=? and member_id=?";
        const val_articleID = [title, user.id];
        connection1.query(sql_articleID, val_articleID, (error, result) => {
          connection1.release();
          if (error) {
            return reject({
              error: true,
              message: error.message + "query article id",
            });
          }
          const articleID = result[0].id;
          if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
              const sql = "insert into images(article_id,imageURL)values(?,?)";
              const val = [articleID, filePath[i]];
              connection1.execute(sql, val, (error, result) => {
                connection1.release();
                if (error) {
                  return reject({
                    error: true,
                    message: error.message + "image",
                  });
                }
              });
            }
            resolve({ ok: true, articleID: articleID, imageURL: filePath });
          } else {
            resolve({ ok: true, articleID: articleID });
          }
        });
      }); //pool
    }); //promise
  } //write
} //class

export default ArticleModel;
