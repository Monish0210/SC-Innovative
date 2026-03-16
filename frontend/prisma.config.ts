import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
	schema: "prisma/schema.prisma",
	datasource: {
		url: env("DATABASE_URL"),
	},
	adapter: async () => new PrismaPg({ connectionString: env("DATABASE_URL") }),
})
