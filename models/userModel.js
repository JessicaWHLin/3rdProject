import jsonwebtoken from "jsonwebtoken";
// const { jsonwebtoken } = pkg;
import mysql from "mysql2";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

//環境參數
const host = process.env.host;
const user = process.env.user;
const password = process.env.password;
const database = process.env.database;
const secretKey = process.env.secretKey;
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
  // console.log("DB=", { host, user, password, database });
  if (error) {
    console.log("error:", error.message);
    return;
  }
  console.log("userModel DB connection OK");
  connection0.release();
});

class UserModel {
  //註冊
  static async signup(username, email, password) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection1) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }
        //檢查有無重複
        connection1.query(
          "select * from member where email =?",
          [email],
          async (error, result) => {
            if (error) {
              connection1.release();
              return reject({ error: true, message: error.message });
            }
            if (result.length > 0) {
              connection1.release();
              return reject({ error: true, message: "Email existed" });
            } else {
              const hashPassword = await bcrypt.hash(password, 6);
              console.log("hashPassword=", hashPassword);
              const sql =
                "insert into member(name,email,password)values(?,?,?)";
              const val = [username, email, hashPassword];
              console.log(
                `receive req：username=${username}, Email=${email}, password=${password}`
              );
              connection1.execute(sql, val, (error, result) => {
                console.log("executed.");
                connection1.release();
                if (error) {
                  return reject({ error: true, message: error.message });
                }
                resolve({ ok: true });
              });
            }
          }
        );
      });
    });
  }

  //登入
  static async signin(email, password) {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection2) => {
        if (error) {
          return reject({ error: true, message: "DB connection failed" });
        }

        const sql = "select id,name,email,password from member where email=?";
        const val = [email];

        connection2.query(sql, val, async (error, result) => {
          connection2.release();
          if (error) {
            return reject({ error: true, message: error.message });
          } else {
            console.log("model-result:", result[0].password);
            if (result.length == 0) {
              return reject({ ok: false, message: "invalid email" });
            } else {
              const verifyResult = await verify_password(
                password,
                result[0].password
              );
              console.log("verifyResult:", verifyResult);
              if (verifyResult.ok) {
                console.log("token:" + createToken(email));
                resolve({
                  ok: true,
                  user: {
                    id: result[0].id,
                    name: result[0].name,
                    email: result[0].email,
                  },
                  token: createToken(email),
                });
              } else if (!verifyResult.ok) {
                return reject({ error: true, message: "invalid password" });
              }
            }
          }
        });
      });
    });
  }
}
export default UserModel;
//-----------------------------------------------------------
function createToken(email) {
  const options = {
    expiresIn: "7d",
  };
  const token = jsonwebtoken.sign({ email }, secretKey, options);
  // console.log("token=", token);
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
