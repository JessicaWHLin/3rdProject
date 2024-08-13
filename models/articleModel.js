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
  connectionLimit: 25,
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
        const sql = `select member.name, article.*,count(DISTINCT article_like.id)as likeQty,count(DISTINCT comment.id) as commentQty from article 
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

  static async findArticleContent(article_id) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection3) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }
        const sql = `select member.name, article.*,count( DISTINCT article_like.id)as likeQty,count(DISTINCT comment.id) as commentQty from article 
        left join member on member.id=article.member_id 
        left join article_like on article.id=article_like.article_id 
        left join comment on article.id=comment.article_id
        where article.id=? 
        group by article.id;`;
        const val = [article_id];
        connection3.query(sql, val, (error, result) => {
          connection3.release();
          if (error) {
            return reject({ error: true, message: error.message + "query article_id" });
          }
          resolve({ ok: true, articles: result });
        });
      });
    });
  }

  static async findArticleImages(article_id) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection4) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }
        const sql = "select imageURL from images where article_id=?";
        const val = [article_id];
        connection4.query(sql, val, (error, result) => {
          connection4.release();
          if (error) {
            return reject({ error: true, message: error.message + "query image" });
          }
          resolve({ ok: true, images: result });
        });
      });
    });
  }
  static async comment(comment, article_id, member_id) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection5) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }
        const sql_insert = `insert into comment(
        member_id,article_id,content)values(?,?,?)`;
        const val_insert = [member_id, article_id, comment];
        connection5.execute(sql_insert, val_insert, (error, result) => {
          connection5.release();

          if (error) {
            return reject({ error: true, message: error.message + "insert comment" });
          }
          //回傳comment info
          const sql_query = `select comment.*,count(DISTINCT comment_like.id) as likeQty,member.name
          from comment
          left join comment_like on comment.id=comment_like.comment_id
          left join member on member.id=comment.member_id
          where comment.id=?
          group by comment.id`;
          const val_query = [result.insertId];
          connection5.query(sql_query, val_query, (error, result) => {
            connection5.release();
            if (error) {
              return reject({ error: true, message: error.message + "query comment" });
            }
            resolve({ ok: true, result });
          });
        });
      });
    });
  }

  static async findComment(article_id) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection6) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }
        const sql = `select comment.*,count(DISTINCT comment_like.id) as likeQty,member.name 
          from comment
          left join comment_like on comment.id=comment_like.comment_id
          left join member on member.id=comment.member_id
          where comment.article_id=?  
          group by comment.id;`;
        const val = [article_id];
        connection6.query(sql, val, (error, result) => {
          connection6.release();
          if (error) {
            return reject({ error: true, message: error.message + "query comment" });
          }
          resolve({ ok: true, result });
        });
      });
    });
  } //findComment

  static async articleLike(article_id, member_id) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection7) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }
        const sql_query = `select id from article_like 
        where article_id=? and member_id=? `;
        const val_query = [article_id, member_id];
        connection7.query(sql_query, val_query, (error, result) => {
          connection7.release();
          console.log(result[0]);
          if (error) {
            return reject({ error: true, message: error.message + "query article_like" });
          }
          if (result.length < 1) {
            const sql_insert = `insert into article_like(article_id,member_id)
            values(?,?)`;
            const val_insert = [article_id, member_id];
            connection7.execute(sql_insert, val_insert, (error, result) => {
              connection7.release();
              if (error) {
                return reject({
                  error: true,
                  message: error.message + "insert article_like",
                });
              }
              const article_like_id = result.insertId;
              return resolve({ ok: true, article_like_id: article_like_id });
            });
          } else {
            const sql_delete = `delete from article_like 
            where id=?`;
            const val_delete = [result[0].id];
            connection7.execute(sql_delete, val_delete, (error, result) => {
              connection7.release();
              if (error) {
                return reject({
                  error: true,
                  message: error.message + "delete article_like",
                });
              }
              return resolve({ ok: false, message: "delete article_like" });
            });
          }
        });
      });
    });
  }

  static async commentLike(comment_id, member_id) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection8) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }
        const sql = `insert into comment_like(comment_id,member_id)
        values(?,?)`;
        const val = [comment_id, member_id];
        connection8.execute(sql, val, (error, result) => {
          connection8.release();
          if (error) {
            return reject({
              error: true,
              message: error.message + "insert comment_like",
            });
          }
          const comment_like_id = result.insertId;
          resolve({ ok: true, comment_like_id: comment_like_id });
        });
      });
    });
  }

  static async latest() {} //latest

  static async popular() {} //popular
} //class

export default ArticleModel;
