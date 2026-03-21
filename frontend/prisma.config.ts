import path from "node:path"
import { fileURLToPath } from "node:url"

import { config as loadEnv } from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg"
import { defineConfig, env } from "prisma/config"

const thisFile = fileURLToPath(import.meta.url)
const thisDir = path.dirname(thisFile)

loadEnv({ path: path.join(thisDir, ".env.local"), quiet: true })
loadEnv({ path: path.join(thisDir, ".env"), quiet: true })

export default defineConfig({
	schema: "prisma/schema.prisma",
	datasource: {
		url: env("DATABASE_URL"),
	},
	// prisma/config types in this setup don't include adapter yet, but runtime supports it.
	// @ts-expect-error adapter is a valid runtime option for Prisma 7 with @prisma/adapter-pg.
	adapter: async () => new PrismaPg({ connectionString: env("DATABASE_URL") }),
})
