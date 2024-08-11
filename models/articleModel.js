import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();
//環境參數
const host = process.env.host;
const user = process.env.user;
const password = process.env.password;
const database = process.env.database;
const db_port = process.env.db_port;
const pool = mysql.createPool({
  host: host,
  user: user,
  port: db_port,
  password: password,
  database: database,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 5,
});

//檢查連線
pool.getConnection((error, connection0) => {
  if (error) {
    console.log("error:", error.message + "articleModel DB failed");
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
        const sql_articleID = "select id from article where title=? and member_id=?";
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

  static async findArticle(zone) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection2) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }
        const sql = `select member.name, article.*,count(article_like.id)as likeQty,count(comment.id) as commentQty from article 
        left join member on member.id=article.member_id 
        left join article_like on article.id=article_like.article_id 
        left join comment on article.id=comment.article_id
        where zones=? group by article.id,member.name;`;
        const val = [zone];
        connection2.query(sql, val, (error, result) => {
          connection2.release();
          if (error) {
            return reject({ error: true, message: error.message + "query zone" });
          }
          resolve({ ok: true, articles: result });
        });
      });
    }); //promise
  } //findArticle

  static async findArticleDetail(article_id) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection3) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }
        const sql = `select member.name, article.*,count(article_like.id)as likeQty,count(comment.id) as commentQty from article 
        left join member on member.id=article.member_id 
        left join article_like on article.id=article_like.article_id 
        left join comment on article.id=comment.article_id
        where article.id=? group by article.id,member.name;`;
        const val = [article_id];
        connection3.query(sql, val, (error, result) => {
          connection3.release();
          if (error) {
            return reject({ error: true, message: error.message + "query article_id" });
          }
          resolve({ ok: true, articles: result });
        });
      }); //connection3
    });
  } //findArticleDetail

  static async latest() {} //latest

  static async popular() {} //popular
} //class

export default ArticleModel;
