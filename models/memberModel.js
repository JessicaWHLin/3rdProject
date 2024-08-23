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
        // console.log({ result });
        const birthday = new Date(result[0].birthday);
        const formatedBirthday = format(birthday, "yyyy-MM-dd");
        console.log("format=", formatedBirthday);
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
        const hashPassword = await bcrypt.hash(password, 6);
        const sql = `update member 
        set name=?,password=?,birthday=?,aboutMe=?,updated_at=?
        where id=?`;
        const val = [name, hashPassword, birthday, aboutMe, updated_at, member_id];
        await connection3.execute(sql, val);
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
}

export default MemberModel;
