import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

function normalizeConnectionString(raw: string): string {
	try {
		const parsed = new URL(raw)
		const sslmode = parsed.searchParams.get("sslmode")
		const usesLibpqCompat = parsed.searchParams.get("uselibpqcompat") === "true"
		if (
			sslmode &&
			["prefer", "require", "verify-ca"].includes(sslmode) &&
			!usesLibpqCompat
		) {
			parsed.searchParams.set("sslmode", "verify-full")
		}
		return parsed.toString()
	} catch {
		return raw
	}
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
	throw new Error("DATABASE_URL is not defined")
}

const adapter = new PrismaPg({ connectionString: normalizeConnectionString(connectionString) })

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: ["error", "warn"],
	})

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma
}
