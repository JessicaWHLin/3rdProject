import mysql from "mysql2/promise";
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
        return { error: true, message: error.message + "insert profilePhoto" };
      } finally {
        connection1.release();
      }
    } catch (error) {
      return { error: true, mssage: "DB connection failed" };
    }
  }
}

export default MemberModel;
