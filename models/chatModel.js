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
  timezone: "Z",
});

//檢查連線
try {
  const connection0 = await pool.getConnection();
  console.log("chatModel DB connection OK");
  connection0.release();
} catch (error) {
  console.log("error:", error.message + "chatModel DB failed");
}

class ChatModel {
  static async saveHistoryMsg(room_id, member_id, msg, created_at) {
    try {
      const connection1 = await pool.getConnection();
      try {
        const sql = `
    		insert into privateMsg(room_id,member_id,content,created_at)
    		values(?,?,?,?)`;
        const val = [room_id, member_id, msg, created_at];
        await connection1.execute(sql, val);
        return { ok: true };
      } catch (error) {
        return { error: true, message: error.message + "insert privateMsg" };
      } finally {
        connection1.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
  static async queryHistoryMsg(room_id) {
    try {
      const connection2 = await pool.getConnection();
      try {
        const sql = `
          select member.name,privateMsg.* from privateMsg
          left join member on member.id=privateMsg.member_id
            where room_id=?`;
        const val = [room_id];
        const [result] = await connection2.query(sql, val);
        return { ok: true, result };
      } catch (error) {
        return { error: true, message: error.message + " query history msg" };
      } finally {
        connection2.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
  static async queryRoomId(member_id) {
    try {
      const connection3 = await pool.getConnection();
      try {
        const sql = `
        select DISTINCT room_id from privateMsg where room_id like ?`;
        const val = [`%${member_id}%`];
        const [result] = await connection3.query(sql, val);
        return { ok: true, result };
      } catch (error) {
        return { error: true, message: error.message + " query room_id" };
      } finally {
        connection3.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
  static async querySender(member_ids) {
    try {
      const connection4 = await pool.getConnection();
      try {
        const memberIdsArray = member_ids.split(",").map((id) => parseInt(id, 10));
        const sql = `select id, name from member where id in (?)`;
        const val = [memberIdsArray];
        const [result] = await connection4.query(sql, val);
        return { ok: true, result };
      } catch (error) {
        return { error: true, message: error.message + " query member_ids" };
      } finally {
        connection4.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
}

export default ChatModel;
