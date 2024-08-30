import jsonwebtoken from "jsonwebtoken";
import TokenExpiredError from "jsonwebtoken";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

//環境參數
const host = process.env.host;
const user = process.env.user;
const password = process.env.password;
const database = process.env.database;
const db_port = process.env.db_port;
const secretKey = process.env.secretKey;
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
  console.log("authModel DB connection OK");
  connection0.release();
} catch (error) {
  console.log("error:", error.message + "authModel DB failed");
}
class AuthModel {
  //註冊
  static async signup(username, email, password) {
    try {
      const connection1 = await pool.getConnection();
      try {
        //檢查有無重複
        const sql_query = "select * from member where email =?";
        const val_query = [email];
        const [result_query] = await connection1.query(sql_query, val_query);
        if (result_query.length > 0) {
          return { error: true, message: "Email existed" };
        } else {
          const hashPassword = await bcrypt.hash(password, 6);
          try {
            const sql = `insert into member(name,email,password)values(?,?,?)`;
            const val = [username, email, hashPassword];
            await connection1.execute(sql, val);
            return { ok: true };
          } catch (error) {
            return { error: true, message: error.message + "signup" };
          }
        }
      } catch (error) {
        return { error: true, message: error.message + "query member email" };
      } finally {
        connection1.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }

  //登入
  static async signin(email, password) {
    try {
      const connection2 = await pool.getConnection();
      try {
        const sql = "select id,name,email,password from member where email=?";
        const val = [email];
        const [result] = await connection2.query(sql, val);
        if (result.length < 1) {
          return { ok: false, message: "invalid email" };
        } else {
          const verifyResult = await verify_password(password, result[0].password);
          if (verifyResult.ok) {
            return {
              ok: true,
              user: {
                id: result[0].id,
                name: result[0].name,
                email: result[0].email,
              },
              token: createToken(email),
            };
          } else if (!verifyResult.ok) {
            return { ok: false, message: "invalid password" };
          }
        }
      } catch (error) {
        return { error: true, message: error.message + " query email" };
      } finally {
        connection2.release();
      }
    } catch (error) {
      return { error: true, message: "DB connection failed" };
    }
  }
  //user state
  static async checkAuth(fullToken) {
    const result = validateToken(fullToken);
    if (result.ok === true) {
      try {
        const connection3 = await pool.getConnection();
        try {
          const sql = "select id,name,email from member where email=?";
          const val = [result.email];
          const [queryResult] = await connection3.query(sql, val);
          if (queryResult.length < 1) {
            return { error: true, message: "Invalid email" };
          } else {
            // console.log("auth query result:", result);
            return {
              ok: true,
              user: {
                id: queryResult[0].id,
                name: queryResult[0].name,
                email: queryResult[0].email,
              },
            };
          }
        } catch (error) {
          return { error: true, message: error.message + "query auth" };
        } finally {
          connection3.release();
        }
      } catch (error) {
        return { error: true, message: "DB connection failed" };
      }
    } else {
      return { error: true, message: result.message };
    }
  }
} //class的括號

export default AuthModel;
//-----------------------------------------------------------
function createToken(email) {
  const payload = {
    email: email,
    iat: Math.floor(Date.now() / 1000),
  };
  const options = {
    expiresIn: "14d",
  };
  const token = jsonwebtoken.sign(payload, secretKey, options);
  return token;
}
async function verify_password(originalPassword, hashedPassword) {
  const result = await bcrypt.compare(originalPassword, hashedPassword);
  if (result) {
    return { ok: true };
  } else {
    return { ok: false };
  }
}

function validateToken(fullToken) {
  const token = fullToken.split(" ")[1];
  const result = jsonwebtoken.verify(token, secretKey, (error, payload) => {
    if (error) {
      if (error.name === TokenExpiredError) {
        return { ok: false, message: "Token expired" };
      } else {
        return { ok: false, message: error.name };
      }
    } else {
      return { ok: true, email: payload.email };
    }
  });
  return result;
}
