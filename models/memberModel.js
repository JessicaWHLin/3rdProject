import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { format } from "date-fns";
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
  timezone: "Z",
});
//檢查連線
try {
  const connection0 = await pool.getConnection();
  console.log("memberModel DB connection OK");
  connection0.release();
} catch (error) {
  console.log("error:", error.message + "memberModel DB failed");
}

class MemberModel {
  static async profilePhoto(member_id, filePath) {
    try {
      const connection1 = await pool.getConnection();
      try {
        const sql = `update member set profile_photo =? where id=?`;
        const val = [filePath, member_id];
        await connection1.execute(sql, val);
        return { ok: true, photo_url: filePath };
      } catch (error) {
        return { error: true, message: error.message + "update profilePhoto" };
      } finally {
        connection1.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
  static async profile(member_id) {
    try {
      const connection2 = await pool.getConnection();
      try {
        const sql = `select * from member where id=?`;
        const val = [member_id];
        const [result] = await connection2.query(sql, val);
        const birthday = new Date(result[0].birthday);
        const formatedBirthday = format(birthday, "yyyy-MM-dd");
        // console.log("format=", formatedBirthday);
        const profileData = {
          name: result[0].name,
          email: result[0].email,
          birthday: formatedBirthday,
          aboutMe: result[0].aboutMe,
          profile_photo: result[0].profile_photo,
        };
        return { ok: true, profileData };
      } catch (error) {
        return { error: true, message: error.message + "find All profile" };
      } finally {
        connection2.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
  static async updateProfile(member_id, name, password, birthday, aboutMe, updated_at) {
    try {
      const connection3 = await pool.getConnection();
      try {
        if (password == "*******") {
          let sql = `update member 
          set name=?,birthday=?,aboutMe=?,updated_at=?
          where id=?`;
          let val = [name, birthday, aboutMe, updated_at, member_id];
          await connection3.execute(sql, val);
        } else {
          const hashPassword = await bcrypt.hash(password, 6);
          let sql = `update member 
          set name=?,password=?,birthday=?,aboutMe=?,updated_at=?
          where id=?`;
          let val = [name, hashPassword, birthday, aboutMe, updated_at, member_id];
          await connection3.execute(sql, val);
        }

        return { ok: true };
      } catch (error) {
        return { error: true, message: error.message + "update profile" };
      } finally {
        connection3.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
  static async findArticles(member_id, item) {
    try {
      const connection4 = await pool.getConnection();
      try {
        if (item == "myArticles") {
          const sql = `
            select article.id, article.zones,article.class,article.title,article.created_at,
            count(DISTINCT article_like.id)as likeQty, count(DISTINCT comment.id)as commentQty,
            count(distinct views.id)as viewQty
            from article
            left join article_like on article.id=article_like.article_id 
            left join comment on article.id=comment.article_id
            left join views on article.id=views.article_id 
            where article.member_id=?
            group by article.id
            `;
          const val = [member_id];
          const [result] = await connection4.query(sql, val);
          return result;
        } else if (item == "commentArticles") {
          const sql = `
            select DISTINCT article.id, article.zones,article.class,article.title,
            article.created_at,
            count(DISTINCT article_like.id)as likeQty,count(DISTINCT comment.id) as commentQty,
            count(distinct views.id)as viewQty
            from article 
            left join article_like on article.id=article_like.article_id
            left join comment on article.id=comment.article_id 
            left join views on article.id=views.article_id
            where comment.member_id=? 
            group by article.id;
            `;
          const val = [member_id];
          const [result] = await connection4.query(sql, val);
          return result;
        } else if (item == "savedArticles") {
          const sql = `select distinct save_article.article_id,article.zones,article.class,
          article.title,article.created_at,
          count(distinct article_like.id)as likeQty,
          count(distinct comment.id) as commentQty,
          count(distinct views.id)as viewQty
          from article
          left join save_article on article.id=save_article.article_id
          left join article_like on article.id=article_like.article_id
          left join comment on article.id=comment.article_id
          left join views on article.id=views.article_id
          where save_article.member_id=?
          group by save_article.article_id;`;
          const val = [member_id];
          const [result] = await connection4.query(sql, val);
          return result;
        }
      } catch (error) {
        return { error: true, message: error.message + " find member articles" };
      } finally {
        connection4.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
}

export default MemberModel;
