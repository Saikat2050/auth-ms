require("dotenv").config()
import {PG} from "./PG"
import {PoolClient, PoolConfig} from "pg"
import eventEmitter from "./logging"

export class ProvidersFactory {
	private static connectionPG: any = {}
	private static clientConnections: any = {}
	constructor() {}

	public async getPoolClient(dbName: string): Promise<PoolClient> {
		try {
			const redis = global.universalRedisClient
			const redisClient = await redis.connectRedisClient()
			let dbConfig = await redisClient.hGetAll(
				`providers_factory_for_${dbName}`
			)

			// check for server configuration
			let dbConfigArr = Object.keys(dbConfig)
			if (!dbConfigArr?.length) {
				dbConfig = null
			}

			if (!dbConfig) {
				// check if dbName does not exist then create new database
				if (!ProvidersFactory.connectionPG[dbName]) {
					ProvidersFactory.connectionPG[dbName] =
						this.createPG(dbName)
				}

				await redisClient.hSet(
					`providers_factory_for_${dbName}`,
					ProvidersFactory.connectionPG[dbName]
				)

				dbConfig = await redisClient.hGetAll(
					`providers_factory_for_${dbName}`
				)
			}
			dbConfig = JSON.stringify(dbConfig, null, 2)
			dbConfig = JSON.parse(dbConfig)

			// connecting to existing database or newly created database
			const pg: PG = dbConfig

			const client: any = await pg.getPool().connect()

			const oldClientQuery = client.query

			if (!client.queryMethodPatched) {
				client.query = (...args: any) => {
					eventEmitter.emit("logging", ` SQL := ${args[0]}`)
					return oldClientQuery.apply(client, args)
				}
			}

			return client
		} catch (error) {
			eventEmitter.emit("logging", `getPoolClient error: ${error}`)
			return await this.getPoolClient(dbName)
		}
	}

	public async transaction(
		dbName?: string
	): Promise<{query: Function; release: Function}> {
		if (!dbName) {
			dbName = process.env.MAIN_DB_NAME as string
		}

		try {
			// const client = await this.getPoolClient(dbName)
			// check if dbName does not exist then create new database
			if (!ProvidersFactory.clientConnections[dbName]) {
				ProvidersFactory.clientConnections[dbName] =
					await this.getPoolClient(dbName)
			}

			const client = ProvidersFactory.clientConnections[dbName]

			const query = client.query.bind(client)

			const release = () => {}

			return {query, release}
		} catch (error) {
			eventEmitter.emit("logging", `create transaction error: ${error}`)
			delete ProvidersFactory.connectionPG[dbName]
			return await this.transaction(dbName)
		}
	}

	private createPG(dbName: string): PG {
		try {
			const config: PoolConfig = {
				host: process.env.DB_HOST as string,
				port: parseInt(process.env.DB_PORT as string),
				user: process.env.DB_USER as string,
				password: process.env.DB_PASSWORD as string,
				database: dbName,
				max: 10,
				connectionTimeoutMillis: 0,
				// idleTimeoutMillis: 1,
				allowExitOnIdle: true
			}
			return new PG(config)
		} catch (error) {
			eventEmitter.emit("logging", `create client error: ${error}`)
			throw error
		}
	}
}
