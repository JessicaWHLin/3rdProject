import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { createClient } from "redis";
dotenv.config();
//環境參數
const host = process.env.host;
const user = process.env.user;
const password = process.env.password;
const database = process.env.database;
const db_port = process.env.db_port;
const redis_password = process.env.redis_password;
const TOP5Popular = process.env.popular;
const TOP5Latest = process.env.latest;

const pool = mysql.createPool({
  host: host,
  user: user,
  port: db_port,
  password: password,
  database: database,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 25,
  timezone: "Z",
});

//檢查連線(DB)
try {
  const connection0 = await pool.getConnection();
  console.log("articleModel DB connection OK");
  connection0.release();
} catch (error) {
  console.log("error:", error.message + "articleModel DB failed");
}

const client = createClient({
  connectTimeout: 10000,
  password: redis_password,
  socket: {
    host: "redis-11323.c285.us-west-2-2.ec2.redns.redis-cloud.com",
    port: 11323,
  },
});
//檢查連線(Redis)
client.on("error", (err) => console.log("Redis Client Error", err));
try {
  await client.connect();
  console.log("Redis connection OK ");
} catch (error) {
  console.log("Error:", error);
}

class ArticleModel {
  //發表
  static async write(user, zone, Class, title, content, files, filePath) {
    try {
      const connection1 = await pool.getConnection();
      try {
        const sql =
          "insert into article(member_id,zones,class,title,content)values(?,?,?,?,?)";
        const val = [user.id, zone, Class, title, content];
        const [result] = await connection1.execute(sql, val);
        const article_id = result.insertId; //文章編號
        //存放圖片
        if (files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            try {
              const sql = "insert into images(article_id,imageURL)values(?,?)";
              const val = [article_id, filePath[i]];
              await connection1.execute(sql, val);
            } catch (error) {
              return {
                error: true,
                message: error.message + "insert image",
              };
            }
          }
          return { ok: true, articleID: article_id, imageURL: filePath };
        } else {
          return { ok: true, articleID: article_id };
        }
      } catch (error) {
        return {
          error: true,
          message: error.message + "insert content",
        };
      } finally {
        connection1.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }

  static async findArticle(zone, keyword) {
    console.log({ zone, keyword });
    try {
      const connection2 = await pool.getConnection();
      if (zone) {
        try {
          const sql = `select member.name, article.*,count(DISTINCT article_like.id)as likeQty,
          count(DISTINCT comment.id) as commentQty,
          count(distinct views.id)as viewQty
          from article
          left join member on member.id=article.member_id
          left join article_like on article.id=article_like.article_id
          left join comment on article.id=comment.article_id
          left join views on article.id=views.article_id
          where zones=? group by article.id;`;
          const val = [zone];
          const [result] = await connection2.query(sql, val);
          return { ok: true, result };
        } catch (error) {
          return { error: true, message: error.message + "query zone" };
        } finally {
          connection2.release();
        }
      } else if (keyword) {
        try {
          const sql = `select member.name, article.*,count(DISTINCT article_like.id)as likeQty,
          count(DISTINCT comment.id) as commentQty, 
          count(distinct views.id)as viewQty
          from article
          left join member on member.id=article.member_id
          left join article_like on article.id=article_like.article_id
          left join comment on article.id=comment.article_id
          left join views on article.id=views.article_id
          where article.title like ? or article.zones like ?
          group by article.id;`;
          const val = [`%${keyword}%`, `%${keyword}%`];
          const [result] = await connection2.query(sql, val);
          return { ok: true, result };
        } catch (error) {
          return { error: true, message: error.message + " query keyword" };
        } finally {
          connection2.release();
        }
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }

  static async findArticleContent(article_id) {
    try {
      const connection3 = await pool.getConnection();
      try {
        const sql = `select member.name, article.*,count( DISTINCT article_like.id)as likeQty,
        count(DISTINCT comment.id) as commentQty 
        from article 
        left join member on member.id=article.member_id 
        left join article_like on article.id=article_like.article_id 
        left join comment on article.id=comment.article_id
        where article.id=? 
        group by article.id;`;
        const val = [article_id];
        const [result] = await connection3.query(sql, val);
        return { ok: true, articles: result };
      } catch (error) {
        return { error: true, message: error.message + "query article_id" };
      } finally {
        connection3.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }

  static async findArticleImages(article_id) {
    try {
      const connection4 = await pool.getConnection();
      try {
        const sql = "select imageURL from images where article_id=?";
        const val = [article_id];
        const [result] = await connection4.query(sql, val);
        return { ok: true, images: result };
      } catch (error) {
        return { error: true, message: error.message + "query image" };
      } finally {
        connection4.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
  static async comment(comment, article_id, member_id) {
    //新增留言
    try {
      const connection5 = await pool.getConnection();
      try {
        const sql_insert = `
        insert into comment(
        member_id,article_id,content)values(?,?,?)`;
        const val_insert = [member_id, article_id, comment];
        const [result_comment] = await connection5.execute(sql_insert, val_insert);
        //回傳留言
        try {
          const sql_query = `select comment.*,member.name
            from comment
            left join member on member.id=comment.member_id
            where comment.id=?
            group by comment.id`;
          const val_query = [result_comment.insertId];
          const [result] = await connection5.query(sql_query, val_query);
          return { ok: true, result };
        } catch (error) {
          return { error: true, message: error.message + "query comment" };
        }
      } catch (error) {
        return { error: true, message: error.message + "insert comment" };
      } finally {
        connection5.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }

  static async findComment(article_id) {
    try {
      const connection6 = await pool.getConnection();
      try {
        const sql = `select comment.*,member.name 
          from comment
          left join member on member.id=comment.member_id
          where comment.article_id=?  
          group by comment.id;`;
        const val = [article_id];
        const [result] = await connection6.query(sql, val);
        return { ok: true, result };
      } catch (error) {
        return { error: true, message: error.message + "query comment" };
      } finally {
        connection6.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }

  static async articleLike(article_id, member_id) {
    try {
      const connection7 = await pool.getConnection();
      try {
        const sql_query = `select id from article_like 
        where article_id=? and member_id=? `;
        const val_query = [article_id, member_id];
        const [result] = await connection7.query(sql_query, val_query);
        if (result.length < 1) {
          try {
            const sql_insert = `
            insert into article_like(article_id,member_id) values(?,?)`;
            const val_insert = [article_id, member_id];
            const [result_add] = await connection7.execute(sql_insert, val_insert);
            const article_like_id = result_add.insertId;
            return { ok: true, article_like_id: article_like_id };
          } catch (error) {
            return {
              error: true,
              message: error.message + "insert article_like",
            };
          }
        } else {
          try {
            const sql_delete = `delete from article_like where id=?`;
            const val_delete = [result[0].id];
            await connection7.execute(sql_delete, val_delete);
            return { ok: false, message: "delete article_like" };
          } catch (error) {
            return {
              error: true,
              message: error.message + "delete article_like",
            };
          }
        }
      } catch (error) {
        return { error: true, message: error.message + "query article_like" };
      } finally {
        connection7.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }

  static async latest() {
    try {
      const redisArticles = await client.get(TOP5Latest);
      if (redisArticles) {
        return { ok: true, result: JSON.parse(redisArticles), redis: true };
      }
    } catch (error) {
      console.log("redis error:", error);
    }
    try {
      const connection9 = await pool.getConnection();
      try {
        const sql = `select article.id, article.title,article.zones,article.class,article.created_at,
        count(distinct comment.id) as commentQty,
        count(distinct article_like.id) as likeQty,
        count(distinct views.id)as viewQty
        from article
        left join comment on article.id=comment.article_id
        left join article_like on article.id=article_like.article_id
        left join views on article.id=views.article_id
        group by article.id
        order by created_at desc
        limit 5;
         `;
        const [result] = await connection9.query(sql);
        await client.set(TOP5Latest, JSON.stringify(result));
        return { ok: true, result };
      } catch (error) {
        return { error: true, message: error.message + " find latest article" };
      } finally {
        connection9.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
  static async latest_all() {
    try {
    } catch (error) {
      return {};
    }
  }
  static async popular_all() {}

  static async popular() {
    try {
      const redisArticles = await client.get(TOP5Popular);
      if (redisArticles) {
        return { ok: true, result: JSON.parse(redisArticles), redis: true };
      }
    } catch (error) {
      console.log("redis error:", error);
    }
    try {
      const connection14 = await pool.getConnection();
      try {
        const sql = `select article.id,article.title,article.zones,article.class,article.created_at,
        count(distinct comment.id)as commentQty,
        count(distinct article_like.id)as likeQty,
        count(distinct views.id)as viewQty
        from article
        left join comment on article.id=comment.article_id
        left join article_like on article.id=article_like.article_id
        left join views on article.id=views.article_id
        group by article.id
        order by viewQty desc
        limit 5;
        `;
        const [result] = await connection14.query(sql);
        await client.setEx(TOP5Popular, 3600, JSON.stringify(result)); //TTL(time to live):1hr
        return { ok: true, result };
      } catch (error) {
        return { error: true, message: error.message + " find popular article" };
      } finally {
        connection14.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  } //popular

  static async savedArticles(member_id, article_id) {
    try {
      const connection10 = await pool.getConnection();
      try {
        const sql_query = `select id from save_article
        where article_id=?and member_id=?`;
        const val_query = [article_id, member_id];
        const [result] = await connection10.query(sql_query, val_query);
        console.log({ result });
        if (result.length < 1) {
          try {
            const sql_save = `insert into save_article(member_id,article_id)
            values(?,?)`;
            const val_save = [member_id, article_id];
            const [result_save] = await connection10.execute(sql_save, val_save);
            const save_article_id = result_save.insertId;
            return { ok: true, message: save_article_id[0] };
          } catch (error) {
            return { error: true, message: error.message + " insert save_article" };
          }
        } else {
          try {
            const sql_delete = `delete from save_article where id=?`;
            const val_delete = [result[0].id];
            await connection10.execute(sql_delete, val_delete);

            return { ok: true, message: "delete save_article" };
          } catch (error) {
            return { error: true, message: error.message + " delete save_article" };
          }
        }
      } catch (error) {
        return { error: true, message: error.message + " query save_article" };
      } finally {
        connection10.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
  static async findSavedArticle(member_id, article_id) {
    try {
      const connection11 = await pool.getConnection();
      try {
        const sql = `select id from save_article where member_id=? and article_id=?`;
        const val = [member_id, article_id];
        const [result] = await connection11.query(sql, val);
        if (result.length > 0) {
          return { ok: true, result };
        } else {
          return { ok: false };
        }
      } catch (error) {
        return { error: true, message: error.message + " query save_article" };
      } finally {
        connection11.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }

  static async findLikedArticle(member_id, article_id) {
    try {
      const connection15 = await pool.getConnection();
      try {
        const sql = `select id from article_like where member_id=? and article_id=? `;
        const val = [member_id, article_id];
        const [result] = await connection15.query(sql, val);
        if (result.length > 0) {
          return { ok: true, result };
        } else {
          return { ok: false };
        }
      } catch (error) {
        return { error: true, message: error.message + " query like_article" };
      } finally {
        connection15.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }

  static async view(article_id, tracking_id) {
    try {
      const connection12 = await pool.getConnection();
      try {
        const sql = `select * from views 
        where article_id=? and tracking_id=?`;
        const val = [article_id, tracking_id];
        const [result] = await connection12.query(sql, val);
        if (result.length < 1) {
          try {
            const sql_insert = `insert into views(article_id,tracking_id)
              values(?,?)`;
            const val_insert = [article_id, tracking_id];
            const [result_insert] = await connection12.execute(sql_insert, val_insert);
            const view_id = result_insert.insertId;
            return { ok: true, view_id: view_id };
          } catch (error) {
            return { error: true, message: error.message + " insert viewCount" };
          }
        } else {
          return { ok: true, message: "today already counted" };
        }
      } catch (error) {
        return { error: true, message: error.message + " query viewCount" };
      } finally {
        connection12.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
  static async sumViewCount(article_id) {
    try {
      const connection13 = await pool.getConnection();
      try {
        const sql = `select count(article_id) as viewQty from views
        where article_id=?`;
        const val = [article_id];
        const [result] = await connection13.query(sql, val);
        return { ok: true, viewQty: result[0].viewQty };
      } catch (error) {
        return { error: true, message: error.message + " query viewQty" };
      } finally {
        connection13.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
} //class

export default ArticleModel;
