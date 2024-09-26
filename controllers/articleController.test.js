import articleController from "./articleController.js";
import AuthModel, { pool } from "../models/authModel.js";
import ArticleModel from "../models/articleModel.js";
jest.mock("../models/authModel.js");
jest.mock("../models/articleModel.js");

describe("articleController.favorite", () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: { authorization: `Bearer token123` },
      body: {
        article_id: 99,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });
  test("should save favorite article when authenticated", async () => {
    AuthModel.checkAuth.mockResolvedValue({ ok: true, user: { id: 99 } });
    ArticleModel.savedArticles.mockResolvedValue({ ok: true, message: "Article saved!" });
    await articleController.favorite(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true, message: "Article saved!" });
  });
  test("should return code 400 when un-authenticated", async () => {
    AuthModel.checkAuth.mockResolvedValue({ ok: false });
    await articleController.favorite(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "un-signin" });
  });
});

afterAll(async () => {
  await pool.end();
});
