import { betterAuth } from "better-auth";
import { getDb } from "./db";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "change-me-in-production",
  appName: "Notes App",
  baseURL: process.env.AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",
  database: getDb(),
  emailAndPassword: {
    enabled: true,
  },
});
