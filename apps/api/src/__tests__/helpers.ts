import supertest from "supertest";
import { app } from "../app";
import { pool } from "../config/db";

export const request = supertest(app);

export async function loginAsAdmin() {
  const res = await request
    .post("/api/admin/auth/login")
    .send({ email: "admin@konnit.vn", password: "admin123" });
  // Lấy cookie từ response
  const cookie = res.headers["set-cookie"];
  return { cookie, user: res.body.data };
}

export async function cleanupTestData() {
  await pool.query("DELETE FROM cms_sections WHERE title LIKE '%[TEST]%'");
  await pool.query("DELETE FROM cms_pages WHERE title LIKE '%[TEST]%'");
  await pool.query("DELETE FROM cms_categories WHERE name LIKE '%[TEST]%'");
}