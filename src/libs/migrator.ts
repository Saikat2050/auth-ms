import Postgrator from "postgrator"
import pg from "pg"
import * as path from "path"

import eventEmitter from "./logging"
import { ProvidersFactory } from "./ProvidersFactory"

export default {
	migrator
}
export async function migrator() {
	// For main db migration 
	await accumulatedMigrationProcess(process.env.MAIN_DB_NAME as string, "mainMigrations", "schemaversion")

	// For other APIs migration
	const providersFactory = new ProvidersFactory()
	const {query, release} = await providersFactory.transaction()

	const {rows} = await query(`
		SELECT *
		FROM "configs" AS cfg
		WHERE "deletedAt" IS NULL
		AND status IS TRUE
	`)

	const apiMigrations = JSON.parse(rows)

	for (let apiMigrationData of apiMigrations) {
		await accumulatedMigrationProcess(apiMigrationData.slug as string, "repoMigrations", "unified_schemaversion")
	}

	// await Promise.all(
	// 	apiMigrations.map((el) => accumulatedMigrationProcess(el.slug as string, "repoMigrations", "unified_schemaversion"))
	// )
}

async function accumulatedMigrationProcess(slug: string, migrationPath: string, schemaTable: string) {
	// create client
	const client = new pg.Client({
		host: process.env.DB_HOST as string,
		port: parseInt(process.env.DB_PORT as string),
		database: slug,
		user: process.env.DB_USER as string,
		password: process.env.DB_PASSWORD as string
	})
	
	try {
		await client.connect()
	} catch (err) {
		eventEmitter.emit("logging", `Database connection failed for - ${slug}`, err)
		process.exit()
	}

	// Create postgrator instance
	const postgrator = new Postgrator({
		migrationPattern: path.resolve(__dirname, `../../migrations/${migrationPath}/*`),
		driver: "pg",
		database: slug,
		schemaTable: schemaTable,
		execQuery: (query) => client.query(query)
	})

	// logging when debug
	postgrator.on("validation-started", (migration) =>
		eventEmitter.emit("logging", migration)
	)
	postgrator.on("validation-finished", (migration) =>
		eventEmitter.emit("logging", migration)
	)
	postgrator.on("migration-started", (migration) =>
		eventEmitter.emit("logging", migration)
	)
	postgrator.on("migration-finished", (migration) =>
		eventEmitter.emit("logging", migration)
	)

	try {
		eventEmitter.emit("logging", `Migration function started - ${slug}.`)
		await postgrator.migrate()
		eventEmitter.emit("logging", `Migration function Ended - ${slug}.`)
	} catch (err: any) {
		eventEmitter.emit("logging", `Migration function failed - ${slug}.\n${err.message}`)
		process.exit()
	}

	await client.end()
	return true
}
