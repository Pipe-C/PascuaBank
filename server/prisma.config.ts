import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL
    ? env("DATABASE_URL")
    : "pascuabank:pascuabank_dev_only@postgres:5432/pascuabank?schema=public",
  },
});