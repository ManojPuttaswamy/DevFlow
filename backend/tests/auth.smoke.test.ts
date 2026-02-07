process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://test_user:test_password@localhost:5432/test_db";

import express from "express";
import request from "supertest";
import authRoutes from "../src/routes/authRoutes";
import userRoutes from "../src/routes/userRoutes";
import prisma from "../src/utils/database";

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRoutes);
  app.use("/users", userRoutes);
  return app;
}

describe("Auth smoke test", () => {
  beforeAll(async () => {
    // Clean users table (idempotent)
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("user can register, login, and access protected route", async () => {
    const email = "testuser@example.com";
    const password = "Password123!";
    const username = "testuser";

    // 1️ Register
    const registerRes = await request(makeApp())
      .post("/auth/register")
      .send({
        email,
        password,
        username,
        firstName: "Test",
        lastName: "User",
      })
      .expect(201);

    expect(registerRes.body.user.email).toBe(email);

    // 2️ Login
    const loginRes = await request(makeApp())
      .post("/auth/login")
      .send({ email, password })
      .expect(200);

    const token = loginRes.body.token;
    expect(token).toBeDefined();

    // 3️ Access protected route
    const profileRes = await request(makeApp())
      .get("/users/profile/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(profileRes.body.user.email).toBe(email);
  });
});