import AuthModel, { pool, verify_password } from "./authModel.js";
import bcrypt from "bcrypt";
afterAll(() => {
  pool.end();
});

test("verify_password", async () => {
  const originalPassword = "123456";
  const hashedPassword = await bcrypt.hash(originalPassword, 6);
  const result = await verify_password(originalPassword, hashedPassword);
  expect(result).toEqual({ ok: true });
});

test("signin", async () => {
  const wrongemail = "testt@testt.com";
  const correctemail = "test2@test2.com";
  const fakepassword = "654321";
  const result_wrong_email = await AuthModel.signin(wrongemail, fakepassword);
  const result_wrong_password = await AuthModel.signin(correctemail, fakepassword);
  expect(result_wrong_email).toEqual({ ok: false, message: "invalid email" });
  expect(result_wrong_password).toEqual({ ok: false, message: "invalid password" });
});
