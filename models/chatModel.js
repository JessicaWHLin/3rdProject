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
  timezone: "Z",
});

//檢查連線
pool.getConnection((error, connection0) => {
  if (error) {
    console.log("error:", error.message + "chatModel DB failed");
    return;
  }
  console.log("chatModel DB connection OK");
  connection0.release();
});

class ChatModel {
  static async saveHistoryMsg(room_id, member_id, msg, created_at) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection1) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }
        const sql = `
				insert into privateMsg(room_id,member_id,content,created_at)
				values(?,?,?,?)`;
        const val = [room_id, member_id, msg, created_at];
        connection1.execute(sql, val, (error, result) => {
          connection1.release();
          if (error) {
            return reject({ error: true, message: error.message + "insert privateMsg" });
          }
          resolve({ ok: true });
        });
      });
    });
  }
  static async queryHistoryMsg(room_id) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection2) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }
        const sql = `
				select member.name,privateMsg.* from privateMsg
				left join member on member.id=privateMsg.member_id
				 where room_id=?`;
        const val = [room_id];
        connection2.query(sql, val, (error, result) => {
          connection2.release();
          if (error) {
            return reject({ error: true, message: error.message + "query history msg" });
          }
          resolve({ ok: true, result });
        });
      });
    });
  }
  static async queryRoomId(member_id) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection3) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }

        const sql = `
        select DISTINCT room_id from privateMsg where room_id like ?`;
        const val = [`%${member_id}%`];
        connection3.query(sql, val, (error, result) => {
          connection3.release();
          if (error) {
            return reject({ error: true, message: error.message + "query room_id" });
          }
          resolve({ ok: true, result });
        });
      });
    });
  }
  static async querySender(member_ids) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection4) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }
        const memberIdsArray = member_ids.split(",").map((id) => parseInt(id, 10));
        const sql = `select id, name from member where id in (?)`;
        const val = [memberIdsArray];
        connection4.query(sql, val, (error, result) => {
          connection4.release();
          if (error) {
            return reject({ error: true, message: error.message + "query member_ids" });
          }
          console.log({ result });
          resolve({ ok: true, result });
        });
      });
    });
  }
}

export default ChatModel;
