import express from "express";
import request from "supertest";

// Import the real router (route-level API testing)
import userRoutes from "../src/routes/userRoutes";

// Mock prisma + notification service
jest.mock("../src/utils/database", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../src/services/notificationService", () => ({
  notificationService: {
    createProfileViewNotification: jest.fn(),
  },
}));

import prisma from "../src/utils/database";
import { notificationService } from "../src/services/notificationService";

const mockedFindUnique = prisma.user.findUnique as jest.Mock;
const mockedUpdate = prisma.user.update as jest.Mock;
const mockedNotify = notificationService.createProfileViewNotification as jest.Mock;

function makeApp() {
  const app = express();
  app.use(express.json());

  // Test-only middleware: set req.user from header (simulates optionalAuth behavior)
  app.use((req, _res, next) => {
    const id = req.header("x-test-user-id");
    if (id) (req as any).user = { id };
    next();
  });

  app.use("/users", userRoutes);
  return app;
}

describe("GET /users/:username profileViews regression", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does NOT increment views or notify when viewer == profile owner (self-view)", async () => {
    mockedFindUnique.mockResolvedValue({
      id: "u1",
      username: "manoj",
      firstName: "M",
      lastName: "P",
      bio: "",
      avatar: null,
      title: null,
      company: null,
      location: null,
      website: null,
      githubUrl: null,
      linkedinUrl: null,
      twitterUrl: null,
      portfolioUrl: null,
      skills: [],
      experience: null,
      availability: null,
      profileViews: 10,
      createdAt: new Date(),
      projects: [],
      _count: { projects: 0, reviewsGiven: 0, reviewsReceived: 0 },
    });

    const app = makeApp();
    const res = await request(app)
      .get("/users/manoj")
      .set("x-test-user-id", "u1")
      .expect(200);

    expect(res.body.user.profileViews).toBe(10);
    expect(mockedUpdate).not.toHaveBeenCalled();
    expect(mockedNotify).not.toHaveBeenCalled();
  });

  test("increments views and notifies when viewer is a different logged-in user", async () => {
    mockedFindUnique.mockResolvedValue({
      id: "u1",
      username: "manoj",
      firstName: "M",
      lastName: "P",
      bio: "",
      avatar: null,
      title: null,
      company: null,
      location: null,
      website: null,
      githubUrl: null,
      linkedinUrl: null,
      twitterUrl: null,
      portfolioUrl: null,
      skills: [],
      experience: null,
      availability: null,
      profileViews: 10,
      createdAt: new Date(),
      projects: [],
      _count: { projects: 0, reviewsGiven: 0, reviewsReceived: 0 },
    });

    mockedUpdate.mockResolvedValue({});

    const app = makeApp();
    const res = await request(app)
      .get("/users/manoj")
      .set("x-test-user-id", "u2") // viewer != owner
      .expect(200);

    expect(mockedUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { profileViews: { increment: 1 } },
    });

    expect(mockedNotify).toHaveBeenCalledWith("u1", "u2");

    // Controller mutates returned user.profileViews += 1
    expect(res.body.user.profileViews).toBe(11);
  });

  test("increments views but does NOT notify when viewer is anonymous", async () => {
    mockedFindUnique.mockResolvedValue({
      id: "u1",
      username: "manoj",
      firstName: "M",
      lastName: "P",
      bio: "",
      avatar: null,
      title: null,
      company: null,
      location: null,
      website: null,
      githubUrl: null,
      linkedinUrl: null,
      twitterUrl: null,
      portfolioUrl: null,
      skills: [],
      experience: null,
      availability: null,
      profileViews: 10,
      createdAt: new Date(),
      projects: [],
      _count: { projects: 0, reviewsGiven: 0, reviewsReceived: 0 },
    });

    mockedUpdate.mockResolvedValue({});

    const app = makeApp();
    const res = await request(app)
      .get("/users/manoj")
      .expect(200);

    expect(mockedUpdate).toHaveBeenCalled();
    expect(mockedNotify).not.toHaveBeenCalled();
    expect(res.body.user.profileViews).toBe(11);
  });
});